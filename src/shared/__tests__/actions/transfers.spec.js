/* eslint-disable no-unused-vars */
import map from 'lodash/map';
import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { asTransactionObject } from '@helixnetwork/transaction-converter';
import * as actions from '../../actions/transfers';
import * as addressesUtils from '../../libs/hlx/addresses';
import * as transferUtils from '../../libs/hlx/transfers';
import * as accountsUtils from '../../libs/hlx/accounts';
import * as inputUtils from '../../libs/hlx/inputs';
import { hlx, quorum } from '../../libs/hlx';
import { realm, Account, Node, Wallet, getRealm, initialise } from '../../database';
import accounts from '../__samples__/accounts';
import { addressData, latestAddressObject } from '../__samples__/addresses';
import { newZeroValueTransactionBytes, newValueTransactionBytes } from '../__samples__/txBytes';
import transactions, { newZeroValueTransaction, newValueTransaction } from '../__samples__/transactions';
import { IRI_API_VERSION } from '../../config';

const Realm = getRealm();

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const clearRealm = () => {
    realm.write(() => {
        realm.delete(Account.data);
        realm.delete(Wallet.data);
        realm.delete(Node.data);
    });
};
describe('actions: transfers', () => {
    describe('#makeTransaction', () => {
        let seedStore;

        before(() => {
            Realm.clearTestState();
            initialise(() => Promise.resolve(new Int8Array(64)));
            seedStore = {
                generateAddress: () => Promise.resolve('0'.repeat(72)),
                prepareTransfers: () => () => Promise.resolve(newZeroValueTransactionBytes),
                performPow: (txs) =>
                    Promise.resolve({
                        txs,
                        transactionObjects: map(txs, asTransactionObject),
                    }),
                getDigest: () => Promise.resolve('0'.repeat(72)),
            };
        });

        beforeEach(() => {
            clearRealm();
            Account.create({ name: 'TEST', index: 0 });
            Wallet.createIfNotExists();

            // nock('https://helixmain.net:8085', {
            //     reqheaders: {
            //         'Content-Type': 'application/json',
            //         'X-HELIX-API-Version': IRI_API_VERSION,
            //     },
            // })
            //     .filteringRequestBody(() => '*')
            //     .persist()
            //     .post('/', '*')
            //     .reply(200, (_, body) => {
            //         const { command } = body;

            //         const resultMap = {
            //             getNodeInfo: {
            //                 appVersion: '1.0.0',
            //             },
            //         };

            //         if (body.command === 'getTransactionsToApprove') {
            //             return {
            //                 branchTransaction: '0'.repeat(72),
            //                 trunkTransaction: '0'.repeat(72),
            //             };
            //         }

            //         return resultMap[command] || {};
            //     });
        });

        afterEach(() => {
            clearRealm();
            nock.cleanAll();
        });

        after(() => {
            Realm.clearTestState();
        });

        describe('zero value transactions', () => {
            it('should call prepareTransfers method on seedStore', () => {
                const store = mockStore({ accounts, settings: { quorum: {} } });

                sinon.spy(seedStore, 'prepareTransfers');
                sinon
                    .stub(accountsUtils, 'syncAccountAfterSpending')
                    .returns(() => Promise.resolve([...transactions, ...newZeroValueTransaction]));

                return store
                    .dispatch(actions.makeTransaction(seedStore, '9'.repeat(72), 0, 'foo', 'TEST', true))
                    .then(() => {
                        expect(seedStore.prepareTransfers.calledOnce).to.equal(true);
                        seedStore.prepareTransfers.restore();
                        accountsUtils.syncAccountAfterSpending.restore();
                    });
            });

            it('should create an action of type HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING with updated account state', () => {
                const store = mockStore({ accounts, settings: { remotePoW: true, quorum: {} } });
                const updatedTransactions = [
                    ...transactions,
                    ...map(newZeroValueTransaction, (transaction) => ({
                        ...transaction,
                        persistence: false,
                        broadcasted: true,
                    })),
                ];

                sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() =>
                    Promise.resolve({
                        transactions: updatedTransactions,
                        addressData,
                    }),
                );

                const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([true]);

                Promise.resolve(
                    store
                        .dispatch(actions.makeTransaction(seedStore, '9'.repeat(72), 0, 'foo', 'TEST', true))
                        .then(() => {
                            const expectedAction = {
                                type: 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                                payload: {
                                    accountName: 'TEST',
                                    transactions: updatedTransactions,
                                    addressData,
                                },
                            };
                            const actualAction = store
                                .getActions()
                                .find((action) => action.type === 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING');

                            expect(expectedAction).to.eql(actualAction);
                        }),
                );
                accountsUtils.syncAccountAfterSpending.restore();
                wereAddressesSpentFrom.restore();
            });
        });

        describe('value transactions', () => {
            describe('when receive address is used', () => {
                it('should create an action of type HELIX/ALERTS/SHOW with message "You cannot send to an address that has already been spent from."', () => {
                    const store = mockStore({ accounts, settings: { quorum: {} } });
                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([true]);

                    Promise.resolve(
                        store
                            .dispatch(actions.makeTransaction(seedStore, '9'.repeat(72), 10, 'foo', 'TEST'))
                            .then(() => {
                                const expectedAction = {
                                    category: 'error',
                                    closeInterval: 20000,
                                    message: 'You cannot send to an address that has already been spent from.',
                                    title: 'Sending to spent address',
                                    type: 'HELIX/ALERTS/SHOW',
                                };

                                const actualAction = store
                                    .getActions()
                                    .find((action) => console.log('Action===', action));
                                expect(expectedAction).to.eql(actualAction);
                            }),
                    );
                    wereAddressesSpentFrom.restore();
                });
            });

            describe('when receive address is one of the input addresses', () => {
                it('should create an action of type HELIX/ALERTS/SHOW with message "You cannot send to an address that is being used as an input in the transaction."', () => {
                    const store = mockStore({ accounts, settings: { quorum: {} } });

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    // Receive address
                                    address: '9'.repeat(72),
                                    balance: 5,
                                    keyIndex: 11,
                                    security: 2,
                                },
                                {
                                    address: '8'.repeat(72),
                                    balance: 6,
                                    keyIndex: 12,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    Promise.resolve(
                        store
                            .dispatch(actions.makeTransaction(seedStore, '9'.repeat(64), 10, 'foo', 'TEST', seedStore))
                            .then(() => {
                                const expectedAction = {
                                    category: 'error',
                                    closeInterval: 20000,
                                    message:
                                        'You cannot send to an address that is being used as an input in the transaction.',
                                    title: 'Sending to an input address',
                                    type: 'HELIX/ALERTS/SHOW',
                                };

                                const actualAction = store
                                    .getActions()
                                    .find(
                                        (action) =>
                                            action.type === 'HELIX/ALERTS/SHOW' &&
                                            action.message ===
                                                'You cannot send to an address that is being used as an input in the transaction.',
                                    );

                                expect(expectedAction).to.eql(actualAction);

                                // Restore stubs
                            }),
                    );
                    syncAccount.restore();
                    wereAddressesSpentFrom.restore();
                    getInputs.restore();
                });
            });

            describe('when constructs invalid bundle', () => {
                it('should create an action of type HELIX/ALERTS/SHOW with message "Something went wrong while sending your transfer. Please try again."', () => {
                    const store = mockStore({ accounts, settings: { quorum: {} } });
                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    // Stub prepareTransfers implementation and return invalid trytes.
                    // Invalid trytes should lead to invalid bundle construction
                    const prepareTransfers = sinon.stub(seedStore, 'prepareTransfers').returns(() =>
                        Promise.resolve(
                            map(
                                newValueTransactionBytes,
                                (hexString) =>
                                    // Replace signature message fragments with all nines
                                    `${'9'.repeat(2187)}${hexString.slice(2187)}`,
                            ),
                        ),
                    );

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const getAddressDataUptoRemainder = sinon
                        .stub(addressesUtils, 'getAddressDataUptoRemainder')
                        .returns(() =>
                            Promise.resolve({
                                addressDataUptoRemainder: addressData,
                                remainderAddress: latestAddressObject.address,
                                keyIndex: latestAddressObject.index,
                            }),
                        );

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    address: '9'.repeat(72),
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    Promise.resolve(
                        store
                            .dispatch(actions.makeTransaction(seedStore, '9'.repeat(72), 10, 'foo', 'TEST', seedStore))
                            .then(() => {
                                const expectedAction = {
                                    category: 'error',
                                    closeInterval: 20000,
                                    message: 'Something went wrong while sending your transfer. Please try again.',
                                    title: 'Transfer error',
                                    type: 'HELIX/ALERTS/SHOW',
                                };

                                const actualAction = store
                                    .getActions()
                                    .find(
                                        (action) =>
                                            action.type === 'HELIX/ALERTS/SHOW' &&
                                            action.message ===
                                                'Something went wrong while sending your transfer. Please try again.',
                                    );

                                expect(expectedAction).to.eql(actualAction);
                            }),
                    );
                    // Restore stubs
                    prepareTransfers.restore();
                    syncAccount.restore();
                    getAddressDataUptoRemainder.restore();
                    getInputs.restore();
                    wereAddressesSpentFrom.restore();
                });
            });

            describe('when successfully broadcasts', () => {
                it('should create an action of type HELIX/ALERTS/SHOW with message "Something went wrong while sending your transfer. Please try again."', () => {
                    const store = mockStore({ accounts, settings: { quorum: {} } });

                    const updatedTransactions = [
                        ...transactions,
                        ...map(newValueTransaction, (transaction) => ({
                            ...transaction,
                            persistence: false,
                            broadcasted: true,
                        })),
                    ];

                    const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() =>
                        Promise.resolve({
                            transactions: updatedTransactions,
                            addressData,
                        }),
                    );

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    const getAddressDataUptoRemainder = sinon
                        .stub(addressesUtils, 'getAddressDataUptoRemainder')
                        .returns(() =>
                            Promise.resolve({
                                addressDataUptoRemainder: addressData,
                                remainderAddress: latestAddressObject.address,
                                keyIndex: latestAddressObject.index,
                            }),
                        );

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    address: '9'.repeat(72),
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    Promise.resolve(
                        store
                            .dispatch(actions.makeTransaction(seedStore, '9'.repeat(72), 10, 'foo', 'TEST'))
                            .then(() => {
                                const expectedAction = {
                                    type: 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                                    payload: {
                                        accountName: 'TEST',
                                        transactions: updatedTransactions,
                                        addressData,
                                    },
                                };
                                const actualAction = store
                                    .getActions()
                                    .find(
                                        (action) => action.type === 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                                    );
                                expect(expectedAction).to.eql(actualAction);
                            }),
                    );
                    // Restore stubs
                    syncAccountAfterSpending.restore();
                    syncAccount.restore();
                    getAddressDataUptoRemainder.restore();
                    getInputs.restore();
                    wereAddressesSpentFrom.restore();
                });
            });
        });
    });
});

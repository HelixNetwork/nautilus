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

describe('actions: transfers', () => {
    // Promote Transactions would be removed in a future version
    // describe('#promoteTransaction', () => {
    //     let seedStore;

    //     before(() => {
    //         Realm.clearTestState();
    //         initialise(() => Promise.resolve(new Int8Array(64)));
    //         seedStore = {
    //             performPow: () =>
    //                 Promise.resolve({
    //                     txs: newZeroValueTransactionBytes.slice().reverse(),
    //                     transactionObjects: newZeroValueTransaction.slice().reverse(),
    //                 }),
    //             getDigest: () => Promise.resolve('0'.repeat(64)),
    //         };
    //     });

    //     beforeEach(() => {
    //         Account.create({ name: 'TEST', index: 0 });
    //         Wallet.createIfNotExists();
    //     });

    //     afterEach(() => {
    //         realm.write(() => {
    //             realm.delete(Account.data);
    //             realm.delete(Wallet.data);
    //             realm.delete(Node.data);
    //         });
    //     });

    //     after(() => {
    //         Realm.clearTestState();
    //     });

    //     describe('when called', () => {
    //         let sandbox;

    //         beforeEach(() => {
    //             sandbox = sinon.sandbox.create();

    //             sandbox.stub(accountsUtils, 'syncAccount').returns(() => Promise.reject(new Error()));
    //         });

    //         afterEach(() => {
    //             sandbox.restore();
    //         });

    //         it('should create an action of type HELIX/TRANSFERS/PROMOTE_TRANSACTION_REQUEST', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });

    //             return store
    //                 .dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore))
    //                 .then(() =>
    //                     expect(store.getActions().map((action) => action.type)).to.include(
    //                         'HELIX/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    //                     ),
    //                 );
    //         });

    //         it('should sync account', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });

    //             return store
    //                 .dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore))
    //                 .then(() => expect(accountsUtils.syncAccount.calledOnce).to.equal(true));
    //         });

    //         describe('when remotePoW in settings is false', () => {
    //             it('should create an action of type HELIX/ALERTS/SHOW with message "Your device may become unresponsive for a while."', () => {
    //                 const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });

    //                 return store.dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore)).then(() => {
    //                     const expectedAction = {
    //                         category: 'info',
    //                         closeInterval: 2000,
    //                         message: 'Your device may become unresponsive for a while.',
    //                         title: 'Promoting transaction',
    //                         type: 'HELIX/ALERTS/SHOW',
    //                     };

    //                     const actualAction = store
    //                         .getActions()
    //                         .find(
    //                             (action) =>
    //                             action.type === 'HELIX/ALERTS/SHOW' &&
    //                             action.message === 'Your device may become unresponsive for a while.',
    //                         );
    //                     expect(actualAction).to.eql(expectedAction);
    //                 });
    //             });
    //         });

    //         describe('when remotePoW in settings is true', () => {
    //             it('should not create an action of type HELIX/ALERTS/SHOW with message "Your device may become unresponsive for a while."', () => {
    //                 const store = mockStore({ accounts, settings: { remotePoW: true, quorum: {} } });

    //                 return store.dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore)).then(() => {
    //                     const expectedAction = {
    //                         category: 'info',
    //                         closeInterval: 5500,
    //                         message: 'Your device may become unresponsive for a while.',
    //                         title: 'Promoting transaction',
    //                         type: 'HELIX/ALERTS/SHOW',
    //                     };

    //                     const actualAction = store
    //                         .getActions()
    //                         .find(
    //                             (action) =>
    //                             action.type === 'HELIX/ALERTS/SHOW' &&
    //                             action.message === 'Your device may become unresponsive for a while.',
    //                         );

    //                     expect(actualAction).to.not.eql(expectedAction);
    //                     expect(actualAction).to.equal(undefined);
    //                 });
    //             });
    //         });
    //     });

    //     describe('when successfully syncs account', () => {
    //         it('should dispatch an action of type "HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION" with updated account state', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });
    //             const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
    //                 // Updated account state
    //                 () => Promise.resolve({ addressData, transactions }),
    //             );

    //             return store.dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore)).then(() => {
    //                 const expectedAction = {
    //                     type: 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
    //                     payload: {
    //                         transactions,
    //                         addressData,
    //                     },
    //                 };

    //                 const actualAction = store
    //                     .getActions()
    //                     .find((action) => action.type === 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION');
    //                 expect(actualAction).to.eql(expectedAction);
    //                 // Restore stub
    //                 syncAccount.restore();
    //             });
    //         });
    //     });

    //     describe('when account syncing fails', () => {
    //         it('should dispatch an action of type "HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION" with updated account state', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });
    //             const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
    //                 // Reject account syncing
    //                 () => Promise.reject(new Error()),
    //             );

    //             return store.dispatch(actions.promoteTransaction('0'.repeat(64), 'TEST', seedStore)).then(() => {
    //                 const expectedAction = {
    //                     type: 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
    //                     payload: {
    //                         transactions,
    //                         addressData,
    //                     },
    //                 };

    //                 const actualAction = store
    //                     .getActions()
    //                     .find((action) => action.type === 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION');
    //                 expect(actualAction).to.not.eql(expectedAction);
    //                 expect(actualAction).to.equal(undefined);

    //                 // Restore stub
    //                 syncAccount.restore();
    //             });
    //         });
    //     });

    //     describe('when transaction is already confirmed', () => {
    //         it('should create an action of type "HELIX/ALERTS/SHOW" with message "The transaction you are trying to promote is already confirmed."', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });
    //             const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
    //                 // Updated account state
    //                 () => Promise.resolve({ addressData, transactions }),
    //             );
    //             // Bundle hash of a confirmed value transaction. See __samples__/transactions
    //             const bundleHash = '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd';
    //             return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', seedStore)).then(() => {
    //                 const expectedAction = {
    //                     category: 'success',
    //                     type: 'HELIX/ALERTS/SHOW',
    //                     title: 'Transaction already confirmed',
    //                     message: 'The transaction you are trying to promote is already confirmed.',
    //                     closeInterval: 2000,
    //                 };

    //                 const actualAction = store
    //                     .getActions()
    //                     .find(
    //                         (action) =>
    //                         action.type === 'HELIX/ALERTS/SHOW' &&
    //                         action.message === 'The transaction you are trying to promote is already confirmed.',
    //                     );
    //                 expect(actualAction).to.eql(expectedAction);

    //                 // Restore stub
    //                 syncAccount.restore();
    //             });
    //         });
    //     });

    //     describe('when bundle is not funded', () => {
    //         let sandbox;

    //         beforeEach(() => {
    //             sandbox = sinon.createSandbox();

    //             sandbox.stub(transferUtils, 'isFundedBundle').returns(() => Promise.resolve(false));
    //             sandbox
    //                 .stub(accountsUtils, 'syncAccount')
    //                 .returns(() => Promise.resolve({ addressData, transactions }));
    //         });

    //         afterEach(() => {
    //             sandbox.restore();
    //         });

    //         it('should create an action of type HELIX/ALERTS/SHOW with message "The bundle you are trying to promote is no longer valid"', () => {
    //             const store = mockStore({ accounts, settings: { remotePoW: false, quorum: {} } });

    //             // Bundle hash for unconfirmed value transactions. See __samples__/transactions.
    //             const bundleHash = 'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda';

    //             return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', seedStore)).then(() => {
    //                 const expectedAction = {
    //                     category: 'error',
    //                     title: 'Could not promote transaction',
    //                     message: 'The bundle you are trying to promote is no longer valid',
    //                     closeInterval: 2000,
    //                     type: 'HELIX/ALERTS/SHOW',
    //                 };

    //                 const actualAction = store
    //                     .getActions()
    //                     .find(
    //                         (action) =>
    //                         action.type === 'HELIX/ALERTS/SHOW' &&
    //                         action.message === 'The bundle you are trying to promote is no longer valid',
    //                     );

    //                 expect(expectedAction).to.eql(actualAction);
    //             });
    //         });
    //     });

    //     // TODO: Add coverage when successfully promotes.
    // });

    describe('#makeTransaction', () => {
        let seedStore;

        before(() => {
            Realm.clearTestState();
            initialise(() => Promise.resolve(new Int8Array(64)));
            seedStore = {
                generateAddress: () => Promise.resolve('a'.repeat(72)),
                prepareTransfers: () => () => Promise.resolve(newZeroValueTransactionBytes),
                performPow: (txs) =>
                    Promise.resolve({
                        txs,
                        transactionObjects: map(txs, asTransactionObject),
                    }),
                getDigest: () => Promise.resolve('0'.repeat(64)),
            };
        });

        beforeEach(() => {
            Account.create({ name: 'TEST', index: 0 });
            Wallet.createIfNotExists();

            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { command } = body;

                    const resultMap = {
                        getNodeInfo: {
                            appVersion: '1.0.0',
                        },
                    };

                    if (body.command === 'getTransactionsToApprove') {
                        return {
                            branchTransaction: '0'.repeat(64),
                            trunkTransaction: '0'.repeat(64),
                        };
                    }

                    return resultMap[command] || {};
                });
        });

        afterEach(() => {
            realm.write(() => {
                realm.delete(Account.data);
                realm.delete(Wallet.data);
                realm.delete(Node.data);
            });

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
                    .dispatch(actions.makeTransaction(seedStore, 'b'.repeat(64), 0, 'foo', 'TEST', true))
                    .then(() => {
                        expect(seedStore.prepareTransfers.calledOnce).to.equal(true);
                        seedStore.prepareTransfers.restore();
                        accountsUtils.syncAccountAfterSpending.restore();
                    });
            });

            it('should create an action of type HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING with updated account state', () => {
                const store = mockStore({ accounts, settings: { quorum: {} } });
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

                return store.dispatch(actions.makeTransaction(seedStore, 'b'.repeat(72), 0, '', 'TEST')).then(() => {
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
                    accountsUtils.syncAccountAfterSpending.restore();
                    wereAddressesSpentFrom.restore();
                });
            });
        });

        describe('value transactions', () => {
            // describe('when receive address is used', () => {
            //     it('should create an action of type HELIX/ALERTS/SHOW with message "You cannot send to an address that has already been spent from."', () => {
            //         const store = mockStore({ accounts, settings: { quorum: {} } });
            //         const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([true]);

            //         return store
            //             .dispatch(actions.makeTransaction(seedStore, 'a'.repeat(72), 10, 'foo', 'TEST'))
            //             .then(() => {
            //                 const expectedAction = {
            //                     category: 'error',
            //                     closeInterval: 20000,
            //                     message: 'You cannot send to an address that has already been spent from.',
            //                     title: 'Sending to spent address',
            //                     type: 'HELIX/ALERTS/SHOW',
            //                 };

            //                 const actualAction = store.getActions().find((action) => console.log('Action===', action));
            //                 console.log('Expected1===', expectedAction);
            //                 console.log('Actual1===', actualAction);
            //                 expect(expectedAction).to.eql(actualAction);
            //                 wereAddressesSpentFrom.restore();
            //             });
            //     });
            // });

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
                                    address: 'a'.repeat(64),
                                    balance: 5,
                                    keyIndex: 11,
                                    security: 2,
                                },
                                {
                                    address: 'f'.repeat(64),
                                    balance: 6,
                                    keyIndex: 12,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'a'.repeat(64), 10, 'foo', 'TEST', seedStore))
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
                            syncAccount.restore();
                            wereAddressesSpentFrom.restore();
                            getInputs.restore();
                        });
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
                                    address:
                                        'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'a'.repeat(64), 10, 'foo', 'TEST', seedStore))
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

                            // Restore stubs
                            prepareTransfers.restore();
                            syncAccount.restore();
                            getAddressDataUptoRemainder.restore();
                            getInputs.restore();
                            wereAddressesSpentFrom.restore();
                        });
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
                                    address:
                                        'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'a'.repeat(64), 10, 'foo', 'TEST'))
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
});

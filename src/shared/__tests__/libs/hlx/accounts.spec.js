import assign from 'lodash/assign';
import filter from 'lodash/filter';
import find from 'lodash/find';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import { expect } from 'chai';
import {
    syncAccountOnValueTransactionFailure,
    syncAccountOnSuccessfulRetryAttempt,
    syncAccountDuringSnapshotTransition,
} from '../../../libs/hlx/accounts';
import mockAccounts from '../../__samples__/accounts';
import { latestAddressObject, latestAddressIndex } from '../../__samples__/addresses';
import { newValueTransaction as mockValueTransactionObjects } from '../../__samples__/transactions';

describe('libs: helix/accounts', () => {
    describe('#syncAccountOnValueTransactionFailure', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should mark input addresses as spent', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const inputAddress = 'ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924';

            // Assert that input address is unspent before syncAccountOnValueTransactionFailure is called
            const inputAddressDataBefore = find(accountState.addressData, { address: inputAddress });
            expect(inputAddressDataBefore.spent.local).to.equal(false);

            const result = syncAccountOnValueTransactionFailure(mockValueTransactionObjects, accountState);
            const inputAddressDataAfter = find(result.addressData, { address: inputAddress });
            expect(inputAddressDataAfter.spent.local).to.equal(true);
        });

        it('should add new transaction objects to transactions in state (with persistence & broadcasted properties as false)', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const bundle = '38accd133327f0cdd345b6a657fd48082979cf585088fa87e11d61ea9973f759';

            // Assert that bundle does not exist in existing transactions

            expect(find(accountState.transactions, { bundle })).to.equal(undefined);

            const result = syncAccountOnValueTransactionFailure(mockValueTransactionObjects, accountState);

            expect(find(result.transactions, { bundle })).to.not.equal(undefined);

            expect(result.transactions).to.eql([
                ...accountState.transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: false,
                })),
            ]);
        });
    });

    describe('#syncAccountOnSuccessfulRetryAttempt', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should set "broadcasted" property to true for newly broadcasted transactions', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                transactions: [
                    ...mockAccounts.accountInfo[accountName].transactions,
                    ...map(mockValueTransactionObjects, (transaction) => ({
                        ...transaction,
                        persistence: false,
                        broadcasted: false,
                        // Also assign a fake hash and test that it's overriden by the correct hash
                        hash: '0'.repeat(64),
                    })),
                ],
            };

            const result = syncAccountOnSuccessfulRetryAttempt(mockValueTransactionObjects, accountState);

            expect(result.transactions).to.eql([
                ...mockAccounts.accountInfo[accountName].transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: true,
                })),
            ]);
        });
    });

    describe('#syncAccountDuringSnapshotTransition', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        describe('when address of attached address object already exists in existing address data', () => {
            it('should replace latestAddressObject with existing address object', () => {
                const accountState = mockAccounts.accountInfo[accountName];

                const attachedAddressObject = assign({}, latestAddressObject, { balance: 1000 });

                const result = syncAccountDuringSnapshotTransition(
                    mockValueTransactionObjects,
                    attachedAddressObject,
                    accountState,
                );

                expect(result.addressData).to.eql([
                    ...filter(
                        result.addressData,
                        (addressObject) => addressObject.address !== latestAddressObject.address,
                    ),
                    attachedAddressObject,
                ]);
            });
        });

        describe('when address of attached address object does not exist in existing address data', () => {
            it('should add attachedAddressObject to existing address data and sort addressData by index in ascending order', () => {
                const accountState = {
                    ...mockAccounts.accountInfo[accountName],
                    addressData: orderBy(mockAccounts.accountInfo[accountName].addressData, 'index', ['desc']),
                };

                const attachedAddressObject = {
                    address: 'f'.repeat(64),
                    balance: 0,
                    index: latestAddressIndex + 1,
                    checksum: '6efa1689',
                    spent: { local: false, remote: false },
                };

                const result = syncAccountDuringSnapshotTransition(
                    mockValueTransactionObjects,
                    attachedAddressObject,
                    accountState,
                );

                const expectedAddressData = orderBy([attachedAddressObject, ...accountState.addressData], 'index', [
                    'asc',
                ]);

                expect(result.addressData).to.eql(expectedAddressData);
            });
        });

        it('should add new transaction objects to transactions in state (with persistence property false & broadcasted property true)', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                addressData: [],
            };

            const latestAddressData = mockAccounts.accountInfo[accountName].addressData;

            const result = syncAccountDuringSnapshotTransition(
                mockValueTransactionObjects,
                latestAddressData,
                accountState,
            );

            expect(result.transactions).to.eql([
                ...accountState.transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: true,
                })),
            ]);
        });
    });
});

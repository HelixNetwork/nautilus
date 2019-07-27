import assign from 'lodash/assign';
import each from 'lodash/each';
import find from 'lodash/find';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import {
    prepareTransferArray,
    getTransactionsDiff,
    normaliseBundle,
    categoriseBundleByInputsOutputs,
    performPow,
    performSequentialPow,
    constructBundlesFromTransactions,
    retryFailedTransaction,
    sortTransactionTxBytesArray,
    getTransferValue,
    computeTransactionMessage,
    isValidTransfer,
    isFundedBundle,
    categoriseInclusionStatesByBundleHash,
    assignInclusionStatesToBundles,
    filterZeroValueBundles,
    isBundleTraversable,
    isBundle,
} from '../../../libs/hlx/transfers';
import { confirmedValueBundles, unconfirmedValueBundles, confirmedZeroValueBundles } from '../../__samples__/bundles';
import { helix } from '../../../libs/hlx';
import {
    newValueTransactionBytes,
    newValueAttachedTransactionBytes,
    failedBytesWithCorrectTransactionHashes,
    milestoneBytes,
} from '../../__samples__/txBytes';
import {
    newValueAttachedTransactionBaseTrunk,
    newValueAttachedTransactionBaseBranch,
    newValueAttachedTransaction,
    confirmedValueTransactions,
    unconfirmedValueTransactions,
    failedTransactionsWithCorrectTransactionHashes,
    failedTransactionsWithIncorrectTransactionHashes,
    LATEST_MILESTONE,
    LATEST_SOLID_SUBTANGLE_MILESTONE,
    LATEST_MILESTONE_INDEX,
    LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
} from '../../__samples__/transactions';
import { EMPTY_HASH_TXBYTES, EMPTY_TRANSACTION_HEX, EMPTY_TRANSACTION_MESSAGE } from '../../../libs/hlx/utils';
import { IRI_API_VERSION } from '../../../config';
import { isBundle as bundleValidator } from '@helixnetwork/bundle-validator';
import { asTransactionObject, asTransactionObjects } from '@helixnetwork/transaction-converter';

describe('libs: helix/transfers', () => {
    describe('#getTransferValue', () => {
        let ownAddresses;

        before(() => {
            ownAddresses = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64), 'd'.repeat(64), 'e'.repeat(64)];
        });

        describe('zero value transactions', () => {
            it('should return zero', () => {
                // Zero value transactions have no inputs
                expect(
                    getTransferValue(
                        [],
                        [
                            {
                                value: 0,
                                currentIndex: 0,
                                lastIndex: 1,
                                // Own address
                                address: 'a'.repeat(64),
                            },
                            {
                                value: 0,
                                currentIndex: 1,
                                lastIndex: 1,
                                // Other address
                                address: 'f'.repeat(64),
                            },
                        ],
                        ownAddresses,
                    ),
                ).to.equal(0);
            });
        });

        describe('value transactions', () => {
            describe('with any input address belong to user addresses', () => {
                it('should return a difference of inputs and remainder', () => {
                    expect(
                        getTransferValue(
                            [
                                {
                                    value: -10,
                                    currentIndex: 1,
                                    lastIndex: 4,
                                    address: 'a'.repeat(64),
                                },
                                {
                                    value: -1,
                                    currentIndex: 2,
                                    lastIndex: 4,
                                    address: 'b'.repeat(64),
                                },
                                {
                                    value: -40,
                                    currentIndex: 3,
                                    lastIndex: 4,
                                    address: 'c'.repeat(64),
                                },
                            ],
                            [
                                {
                                    value: 12,
                                    currentIndex: 0,
                                    lastIndex: 4,
                                    address: 'f'.repeat(64),
                                },
                                {
                                    value: 39,
                                    currentIndex: 4,
                                    lastIndex: 4,
                                    address: 'd'.repeat(64),
                                },
                            ],
                            ownAddresses,
                        ),
                    ).to.equal(12);
                });
            });

            describe('with no input addresses belong to user addresses', () => {
                it('should return a sum of all user output addresses', () => {
                    expect(
                        getTransferValue(
                            [
                                {
                                    value: -10,
                                    currentIndex: 1,
                                    lastIndex: 4,
                                    address: '2'.repeat(64),
                                },
                                {
                                    value: -1,
                                    currentIndex: 2,
                                    lastIndex: 4,
                                    address: 'f'.repeat(64),
                                },
                                {
                                    value: -40,
                                    currentIndex: 3,
                                    lastIndex: 4,
                                    address: '3'.repeat(64),
                                },
                            ],
                            [
                                {
                                    value: 12,
                                    currentIndex: 0,
                                    lastIndex: 4,
                                    address: 'd'.repeat(64),
                                },
                                {
                                    value: 39,
                                    currentIndex: 4,
                                    lastIndex: 4,
                                    address: '4'.repeat(64),
                                },
                            ],
                            ownAddresses,
                        ),
                    ).to.equal(12);
                });
            });
        });
    });

    describe('#computeTransactionMessage', () => {
        describe('when bundle has no transaction with a message', () => {
            it(`should return ${EMPTY_TRANSACTION_MESSAGE}`, () => {
                expect(computeTransactionMessage([{ signatureMessageFragment: '0'.repeat(1536) }])).to.equal('Empty');
            });
        });

        describe('when bundle has a transaction with message', () => {
            it('should return message', () => {
                const messageBytes = '54455354204d455353414745';
                expect(
                    computeTransactionMessage([
                        { signatureMessageFragment: '0'.repeat(1536) },
                        { signatureMessageFragment: `${messageBytes}${'0'.repeat(1536 - messageBytes.length)}` },
                    ]),
                ).to.equal('TEST MESSAGE');
            });
        });
    });

    describe('#prepareTransferArray', () => {
        let addressData;

        before(() => {
            addressData = [
                {
                    address: '5'.repeat(64),
                    index: 0,
                    balance: 0,
                    spent: { local: false, remote: false },
                },
                {
                    address: '2'.repeat(64),
                    index: 1,
                    balance: 0,
                    spent: { local: false, remote: false },
                },
            ];
        });

        describe('when value is zero', () => { });

        describe('when value is not zero', () => {
            it('should return a single transfer object', () => {
                expect(prepareTransferArray('5'.repeat(64), 1, '', addressData, 'tag')).to.eql([
                    {
                        address: '5'.repeat(64),
                        tag: 'tag',
                        message: '',
                        value: 1,
                    },
                ]);
            });
        });

        describe('when value is zero', () => {
            describe('when address is part of address data', () => {
                it('should return a single transfer object', () => {
                    expect(prepareTransferArray('5'.repeat(64), 0, '', addressData, 'tag')).to.eql([
                        {
                            address: '5'.repeat(64),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                    ]);
                });
            });

            describe('when address is not part of address data', () => {
                it('should return two transfer objects', () => {
                    expect(prepareTransferArray('a'.repeat(64), 0, '', addressData, 'tag')).to.eql([
                        {
                            address: 'a'.repeat(64),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                        {
                            address: '5'.repeat(64),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                    ]);
                });
            });
        });
    });

    describe('#getTransactionsDiff', () => {
        describe('when second argument size is not greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo'];
            });

            it('should return an empty array', () => {
                expect(getTransactionsDiff(firstArgument, secondArgument)).to.eql([]);
            });
        });

        describe('when second argument size is greater than first argument size', () => {
            let secondArgument;
            let firstArgument;

            beforeEach(() => {
                secondArgument = ['foo', 'baz'];
                firstArgument = ['foo'];
            });

            it('should return an array with difference of first and second arguments', () => {
                expect(getTransactionsDiff(firstArgument, secondArgument)).to.eql(['baz']);
            });
        });
    });

    describe('#normaliseBundle', () => {
        let bundle;
        let addresses;
        let tailTransactions;
        let timestamp;
        let attachmentTimestamp;

        beforeEach(() => {
            timestamp = attachmentTimestamp = Date.now();

            bundle = [
                {
                    currentIndex: 0,
                    hash: '00006a5ebc28b580099eca765a12c0fa2063772398c932a6df1cce5b8c75e028',
                    bundle: '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                    address: 'ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924',
                    value: 20,
                    signatureMessageFragment: '0'.repeat(1536),
                    timestamp,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 1,
                    hash: '00006bf18e4ff0afc2d3cb437613ceabb66eb17746de842c17415ab7f7decfd7',
                    bundle: '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                    address: '1d8fb2f8512e174f861356886f8f0429c64207d3963d59b7f33f463b072f865d',
                    value: -536561674354768,
                    signatureMessageFragment: '0'.repeat(1536),
                    timestamp,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 2,
                    hash: '000030865fdb3e5f2377cd57ef8cd8f28ab81ea9e6ab49d255da18702ed8ac61',
                    bundle: '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                    address: '1d8fb2f8512e174f861356886f8f0429c64207d3963d59b7f33f463b072f865d',
                    value: 536561674354748,
                    signatureMessageFragment: '0'.repeat(1536),
                    timestamp,
                    attachmentTimestamp,
                }
            ];

            addresses = [
                '1d8fb2f8512e174f861356886f8f0429c64207d3963d59b7f33f463b072f865d',
                '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
            ];

            tailTransactions = [
                {
                    currentIndex: 0,
                    hash: '00006a5ebc28b580099eca765a12c0fa2063772398c932a6df1cce5b8c75e028',
                    bundle: '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                    address: 'ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924',
                    value: 1,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 0,
                    hash: '0000e7b4f6e130b3f145e9b05d5f895fd8e6932a73895ec60a131b395c09b041',
                    bundle: 'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda',
                    address: '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
                    value: 23300,
                    attachmentTimestamp,
                },
            ];
        });

        // Note: Test internally used functions separately
        it('should return an object with "bundle" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('bundle');
        });

        it('should return an object with "timestamp" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('timestamp');
        });

        it('should return an object with "attachmentTimestamp" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('attachmentTimestamp');
        });

        it('should return an object with "inputs" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "outputs" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "persistence" prop equalling fourth argument', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false).persistence).to.equal(false);
        });

        it('should return an object with "incoming" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('incoming');
        });

        it('should return an object with "transferValue" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "message" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "tailTransactions" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('tailTransactions');
        });

        it('should only keep tail transactions of the same bundle', () => {
            const normalisedBundle = normaliseBundle(bundle, addresses, tailTransactions, false);

            const tailTransactionFromBundle = find(bundle, { currentIndex: 0 });
            normalisedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(tailTransaction.hash).to.equal(tailTransactionFromBundle.hash),
            );
        });

        it('should only have "hash" and "attachmentTimestamp" props in each object of "tailTransactions" prop', () => {
            const normalisedBundle = normaliseBundle(bundle, addresses, tailTransactions, false);

            normalisedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(keys(tailTransaction)).to.eql(['hash', 'attachmentTimestamp']),
            );
        });
    });

    describe('#categoriseBundleByInputsOutputs', () => {
        let bundlesMap;

        beforeEach(() => {
            bundlesMap = {
                valueTransactionsWithNoRemainder: {
                    bundle: [
                        {
                            hash:
                                '00006a5ebc28b580099eca765a12c0fa2063772398c932a6df1cce5b8c75e028',
                            signatureMessageFragment:
                                '48656c69782054657374205472616e73616374696f6e204f6e65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            address:
                                'ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924',
                            value: 20,
                            obsoleteTag:
                                '77616c6c65740000000000000000000000000000000000000000000000000000',
                            timestamp: 1563260665,
                            currentIndex: 0,
                            lastIndex: 1,
                            bundle:
                                '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                            trunkTransaction:
                                '00006bf18e4ff0afc2d3cb437613ceabb66eb17746de842c17415ab7f7decfd7',
                            branchTransaction:
                                '0000e3a11811d34c7fa873696589e3e37380b531ac36563b4d7ff31c09757adc',
                            tag: '77616c6c65740000',
                            attachmentTimestamp: 1563260672526,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '0000000000015f3b',
                        },
                        {
                            hash:
                                '00006bf18e4ff0afc2d3cb437613ceabb66eb17746de842c17415ab7f7decfd7',
                            signatureMessageFragment:
                                'a2c62acb9fa3ae9c30aa795967af41fef95ec8bd514be213afc2a65bb72a6d0376cae50bb8077af6316b006f376bc17007a9c7b21c91ce0a8bf9be7b303b7bc8053cce7d8b0c71602eca9e8df7aa1f9406fa9293a71a73da8ce925e1e0f58e93caa25e50eef6042fec1c7343f1688575a541f8ec31d8a6a72f7c7758f879e54bd1b8adeba92b0372eaba66be58840d2a2e1f9e3fde6c50f9679d24a6db67c3193e2e63f5c84afdab415bb26f414fb892a553a5ab14e31cd474af1848768149f9a4b3956b1bdfb4b202fc0d3262b6280b255f8822eec280416f76ec5a574067e61c5683ec743fd954af4e7c045ba2e435ed317cf874ffc73434c198d322e85e101693c7a3ae6d606a564e9268bd2a3420f2ebbabaf881281501b6e6998f6e27486b87881bf5ca60ad616f266c0005e635100a657e2f3f49595839b05025cec44a440b99c80453f10e39f7947ef790564f72973e2545e6ad1bc44e09fc3ef4b6778911f7699f451d72db5abf28335af832290a48b73e033d4bc63569eee02c065a7aeb1596c10eb8f0633b9faf992045b4b5c43029932c6c6611e036c1f01e3d5629ecfd7e3709dc9152afc4f69deb1f7c53169b85038da7fc2c029783c592b8663a1c74da22ce2995c0cc0854efe90e6ee2514b1d464ca4b587d3c90faca62b263fe89f8471733e79e4b85a74dfdc68e071951f13fac6a2039d198c4035cd57c8',
                            address:
                                '164838c044a83bbe80ce4bd24547442ae6d496caa5496c4746ae71470c13b4ed',
                            value: -536561674354768,
                            obsoleteTag:
                                '0000000000000000000000000000000000000000000000000000000000000000',
                            timestamp: 1563260665,
                            currentIndex: 1,
                            lastIndex: 1,
                            bundle:
                                '0e0e19b18f216b643189b00fd5c15e5a89e773e9b4b43cd8dfa165335c061cbd',
                            trunkTransaction:
                                '000030865fdb3e5f2377cd57ef8cd8f28ab81ea9e6ab49d255da18702ed8ac61',
                            branchTransaction:
                                '0000e3a11811d34c7fa873696589e3e37380b531ac36563b4d7ff31c09757adc',
                            tag: '0000000000000000',
                            attachmentTimestamp: 1563260672438,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '00000000000021e8',
                        },
                    ],
                    inputs: [
                        {
                            address:
                                '164838c044a83bbe80ce4bd24547442ae6d496caa5496c4746ae71470c13b4ed',
                            value: -536561674354768,
                            hash: '00006bf18e4ff0afc2d3cb437613ceabb66eb17746de842c17415ab7f7decfd7',
                            currentIndex: 1,
                            lastIndex: 1,
                            checksum: '5bc16142',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                'ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924',
                            value: 20,
                            hash: '00006a5ebc28b580099eca765a12c0fa2063772398c932a6df1cce5b8c75e028',
                            currentIndex: 0,
                            lastIndex: 1,
                            checksum: '032e847c',
                        },
                    ],
                },
                zeroValueTransactions: {
                    bundle: [
                        {
                            hash:
                                '0000e3f42b50767b81f51c6d75d789f38a5b34c5eefea2f51f55059f2b5e8a84',
                            signatureMessageFragment:
                                '6c6f72656d20697073756d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            address:
                                'e8beb08da8930027eacd19f806a417ff919bafcc216d9e9483398368be3921ea',
                            value: 0,
                            obsoleteTag:
                                '6162620000000000000000000000000000000000000000000000000000000003',
                            timestamp: 1564041619,
                            currentIndex: 0,
                            lastIndex: 0,
                            bundle:
                                '17a0092e2e17db6d5e35e3ec0b79cf196ae26f94f6a671123ca2788678986572',
                            trunkTransaction:
                                '0072b2146538d371b40532f3d979f14653225350a3dc7d0444fdb343c705bd7c',
                            branchTransaction:
                                '0072b2146538d371b40532f3d979f14653225350a3dc7d0444fdb343c705bd7c',
                            tag: '6162620000000000',
                            attachmentTimestamp: 1564041621178,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '0000000000006584'
                        }

                    ],
                    inputs: [],
                    outputs: [
                        {
                            address:
                                'e8beb08da8930027eacd19f806a417ff919bafcc216d9e9483398368be3921ea',
                            value: 0,
                            hash: '0000e3f42b50767b81f51c6d75d789f38a5b34c5eefea2f51f55059f2b5e8a84',
                            currentIndex: 0,
                            lastIndex: 0,
                            checksum: '5ea70ff8',
                        },
                    ],
                },
                valueTransactionsWithRemainder: {
                    bundle: [
                        {
                            hash:
                                '0000e7b4f6e130b3f145e9b05d5f895fd8e6932a73895ec60a131b395c09b041',
                            signatureMessageFragment:
                                '48656c6978205465737420556e636f6e6669726d65642056616c7565205472616e73616374696f6e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            address:
                                '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
                            value: 5,
                            obsoleteTag:
                                '77616c6c65740000000000000000000000000000000000000000000000000003',
                            timestamp: 1563620049,
                            currentIndex: 0,
                            lastIndex: 2,
                            bundle:
                                'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda',
                            trunkTransaction:
                                '0000866a92837a92bce1d35d5ccce88cfc7718ea6c5b71b026d1ec38ce815088',
                            branchTransaction:
                                '0018134d573a404656104bbe0a1e86ee719c8ddc12ea06fcc4fc9295707e90a4',
                            tag: '77616c6c65740000',
                            attachmentTimestamp: 1563620059327,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '00000000000001ac',
                        },
                        {
                            hash:
                                '0000866a92837a92bce1d35d5ccce88cfc7718ea6c5b71b026d1ec38ce815088',
                            signatureMessageFragment:
                                'f0da493522e5c6a0219bded47fd2c5fd8cda906796bf92993129c8f0dcbe01339183b1809fc58b9a7449676294ffde45a632a18f13e1b8be2e50e720490ce2432b26d26a8a4a0ab5f8e73519477071a063024e522e59dad3d84af8c754eb1c9c2f29b1b46a99c34dcb590047ecffc9b9c9ea74bd0e53b32fda3d35224fcb38abba8fe2ecaffcf790a6a244203db424d90fd0d9d66c6aea97d74b41be5386524eca4840f24c0c3bdb3f662ac3e1a68051f6b184db271f2eadd7966a4a67bf34cee02f880e51a01817e6650992bb23a27f9932964750114828d81fea78f981aa6a1cb4ede6b4cc78983b960e809d865bc82b7cad95b850e1015efa733a5f4c840fe7e37622001c8307d26510e51344e18157240499953bb32dc8207711673f6a206bd50ad99e088a8d48cced29b2c11a64fc8b910dc7991c8975444a4f4a017c586032f70a09268dbb352a56557e1cf52a63cc01fef3114bb5a4824ff16568cb97eeab2858469a98e6ee9eb7635c4a0f4a0ad9117a814f24911b9e7f91830f1d7c7abca3eaf8f741d25423422df5e800e8c442e74aaa87a55a353bea44e04b5dcfb1679ed874c4d9e9da7359f2627da9c75c9b0b797cc20396a482390995045ba9427037c3cf1bd4652a671c9438feb6e1532e8a204e14e9f9bcff68cce403f45a22ed4799c49075a2a30bc8f3c872190dc406acbbac89ab2ddeb612e63fdfee1a',
                            address:
                                '45068a64449bf0830a9d965d658e26bea92551255634e8cd16a093ee8621f062',
                            value: -536561674354608,
                            obsoleteTag:
                                '0000000000000000000000000000000000000000000000000000000000000000',
                            timestamp: 1563620049,
                            currentIndex: 1,
                            lastIndex: 2,
                            bundle:
                                'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda',
                            trunkTransaction:
                                '000045e4e474bbaf0551b03bc4069eb9d005c48362997e555e299c0b24d07e2e',
                            branchTransaction:
                                '0018134d573a404656104bbe0a1e86ee719c8ddc12ea06fcc4fc9295707e90a4',
                            tag: '0000000000000000',
                            attachmentTimestamp: 1563620059140,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '0000000000005d57',
                        },
                        {
                            hash:
                                '000045e4e474bbaf0551b03bc4069eb9d005c48362997e555e299c0b24d07e2e',
                            signatureMessageFragment:
                                '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            address:
                                '7d08aefd4bd8cb244b5bc3841bdc830d994948a213da6ca3f892aba6403e2b6f',
                            value: 536561674354603,
                            obsoleteTag:
                                '0000000000000000000000000000000000000000000000000000000000000000',
                            timestamp: 1563620049,
                            currentIndex: 2,
                            lastIndex: 2,
                            bundle:
                                'b2b43b3b04c06d640cb0b418817b713f11d6b5080e122f42c80efae73f44adda',
                            trunkTransaction:
                                '0018134d573a404656104bbe0a1e86ee719c8ddc12ea06fcc4fc9295707e90a4',
                            branchTransaction:
                                '0018134d573a404656104bbe0a1e86ee719c8ddc12ea06fcc4fc9295707e90a4',
                            tag: '0000000000000000',
                            attachmentTimestamp: 1563620058681,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 127,
                            nonce: '0000000000016795',
                        }
                    ],
                    inputs: [
                        {
                            address:
                                '45068a64449bf0830a9d965d658e26bea92551255634e8cd16a093ee8621f062',
                            value: -536561674354608,
                            hash: '0000866a92837a92bce1d35d5ccce88cfc7718ea6c5b71b026d1ec38ce815088',
                            currentIndex: 1,
                            lastIndex: 2,
                            checksum: 'd00a41c0',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
                            value: 5,
                            hash: '0000e7b4f6e130b3f145e9b05d5f895fd8e6932a73895ec60a131b395c09b041',
                            currentIndex: 0,
                            lastIndex: 2,
                            checksum: 'f818d0b4',
                        },
                        {
                            address:
                                '7d08aefd4bd8cb244b5bc3841bdc830d994948a213da6ca3f892aba6403e2b6f',
                            value: 536561674354603,
                            hash: '000045e4e474bbaf0551b03bc4069eb9d005c48362997e555e299c0b24d07e2e',
                            currentIndex: 2,
                            lastIndex: 2,
                            checksum: '19114c47',
                        },
                    ],
                },
            };
        });

        describe('when transaction object has a negative value', () => {
            it('should categorise as "inputs"', () => {
                for (const prop in bundlesMap) {
                    const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], 1);

                    expect(result.inputs).to.eql(bundlesMap[prop].inputs);
                }
            });
        });

        describe('when transaction object has a non-negative value', () => {
            describe('when outputs size is less than outputs threshold', () => {
                it('should categorise as "outputs"', () => {
                    const outputsThreshold = 4;

                    for (const prop in bundlesMap) {
                        const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], outputsThreshold);

                        expect(result.outputs).to.eql(bundlesMap[prop].outputs);
                    }
                });
            });

            describe('when outputs size is greater than outputs threshold', () => {
                it('should filter outputs with unknown addresses', () => {
                    const {
                        valueTransactionsWithNoRemainder: { bundle },
                    } = bundlesMap;
                    const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                    expect(result.outputs).to.eql([]);
                });

                it('should not filter remainder outputs', () => {
                    const {
                        valueTransactionsWithRemainder: { bundle },
                    } = bundlesMap;
                    const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                    expect(result.outputs).to.eql([
                        {
                            address:
                                '7d08aefd4bd8cb244b5bc3841bdc830d994948a213da6ca3f892aba6403e2b6f',
                            value: 536561674354603,
                            hash: '000045e4e474bbaf0551b03bc4069eb9d005c48362997e555e299c0b24d07e2e',
                            currentIndex: 2,
                            lastIndex: 2,
                            checksum: '19114c47',
                        },
                    ]);
                });
            });
        });
    });

    describe('#performPow', () => {
        describe('when first argument (powFn) is not a function', () => {
            it('should throw an error with message "Proof of work function is undefined."', () => {
                return performPow(undefined, () => Promise.resolve(), [], '0'.repeat(64), '0'.repeat(64))
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Proof of work function is undefined.'));
            });
        });

        describe('when second argument (digestFn) is not a function', () => {
            it('should throw an error with message "Digest function is undefined."', () => {
                return performPow(() => Promise.resolve(), undefined, [], '0'.repeat(64), '0'.repeat(64))
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Digest function is undefined.'));
            });
        });

        describe('when first (powFn) & second (digestFn) arguments are functions', () => {
            describe('when batchedPow is true', () => {
                // it('should call proof-of-work function with txBytes, trunk, branch and minWeightMagnitude', () => {
                //     const powFn = sinon.stub();

                //     powFn.resolves([]);

                //     return performPow(powFn, () => Promise.resolve(), ['foo'], '0'.repeat(64), '3'.repeat(64)).then(
                //         () =>
                //             expect(powFn.calledOnceWithExactly(['foo'], '0'.repeat(64), '3'.repeat(64), 14)).to.equal(
                //                 true,
                //             ),
                //     );
                // });
            });
        });
    });

    describe('#performSequentialPow', () => {
        let powFn;
        let digestFn;
        let trunkTransaction;
        let branchTransaction;

        const nonces = ['N9UIMZQVDYWLXWGHLELNRCUUPMP', 'SLSJJSDPDTDSKEVCBVPMWDNOLAH', 'K9JXMYPREJZGUFFSANKRNPOMAGR'];

        beforeEach(() => {
            powFn = () => {
                let calledTimes = 0;

                return () => {
                    const promise = Promise.resolve(nonces[calledTimes]);
                    calledTimes += 1;

                    return promise;
                };
            };

            digestFn = (txBytes) => Promise.resolve(asTransactionObject(txBytes).hash);

            trunkTransaction = 'LLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999';
            branchTransaction = 'GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999';
        });

        // it('should sort transaction objects in ascending order by currentIndex', () => {
        //     const fn = performSequentialPow(
        //         powFn(),
        //         digestFn,
        //         newValueTransactionBytes.slice().reverse(),
        //         trunkTransaction,
        //         branchTransaction,
        //         14,
        //     );

        //     return fn.then(({ transactionObjects }) => {
        //         transactionObjects.map((tx, idx) => expect(tx.currentIndex).to.equal(idx));
        //     });
        // });

        // it('should assign generated nonce', () => {
        //     const fn = performSequentialPow(
        //         powFn(),
        //         digestFn,
        //         newValueTransactionBytes.slice().reverse(),
        //         trunkTransaction,
        //         branchTransaction,
        //         14,
        //     );
        //     return fn.then(({ transactionObjects }) => {
        //         transactionObjects.map((tx, idx) => expect(tx.nonce).to.equal(nonces.slice().reverse()[idx]));
        //     });
        // });

        // it('should set correct bundle sequence', () => {
        //     const fn = performSequentialPow(
        //         powFn(),
        //         digestFn,
        //         newValueTransactionBytes.slice().reverse(),
        //         trunkTransaction,
        //         branchTransaction,
        //         14,
        //     );

        //     return fn.then(({ transactionObjects }) => {
        //         expect(transactionObjects[0].trunkTransaction).to.equal(transactionObjects[1].hash);
        //         expect(transactionObjects[0].branchTransaction).to.equal(trunkTransaction);

        //         expect(transactionObjects[1].trunkTransaction).to.equal(transactionObjects[2].hash);
        //         expect(transactionObjects[1].branchTransaction).to.equal(trunkTransaction);

        //         expect(transactionObjects[2].trunkTransaction).to.equal(trunkTransaction);
        //         expect(transactionObjects[2].branchTransaction).to.equal(branchTransaction);
        //     });
        // });
    });

    describe('#constructBundlesFromTransactions', () => {
        describe('when provided argument is not an array', () => {
            it('should throw an error with message "Invalid transactions provided"', () => {
                expect(constructBundlesFromTransactions.bind(null, 'foo')).to.throw('Invalid transactions provided.');
            });
        });

        // it('should construct bundles', () => {
        //     // Pass in valid transactions
        //     const bundles = constructBundlesFromTransactions([
        //         ...confirmedValueTransactions,
        //         ...unconfirmedValueTransactions,
        //     ]);

        //     expect(bundles.length > 0).to.equal(true);

        //     bundles.forEach((bundle) => expect(bundleValidator(bundle)).to.equal(true));
        // });
    });

    describe('#retryFailedTransaction', () => {
        let seedStore;

        before(() => {
            seedStore = {
                performPow: (txBytes) =>
                    Promise.resolve({
                        txBytes,
                        transactionObjects: map(txBytes, asTransactionObject),
                    }),
                getDigest: (txBytes) => Promise.resolve(asTransactionObject(txBytes).hash),
            };
        });

        describe('when all transaction objects have valid hash', () => {
            // it('should not perform proof of work', () => {
            //     sinon.stub(seedStore, 'performPow').resolves({
            //         TxBytes: failedBytesWithCorrectTransactionHashes,
            //         transactionObjects: failedTransactionsWithCorrectTransactionHashes,
            //     });

            //     const storeAndBroadcast = sinon.stub(helix, 'storeAndBroadcast').yields(null, []);

            //     return retryFailedTransaction()(failedTransactionsWithCorrectTransactionHashes, seedStore).then(() => {
            //         expect(seedStore.performPow.callCount).to.equal(0);

            //         seedStore.performPow.restore();
            //         storeAndBroadcast.restore();
            //     });
            // });
        });

        describe('when any transaction object has an invalid hash', () => {
            // it('should perform proof of work', () => {
            //     sinon.stub(seedStore, 'performPow').resolves({
            //         TxBytes: newValueAttachedTransactionBytes,
            //         transactionObjects: newValueAttachedTransaction,
            //     });

            //     const storeAndBroadcast = sinon.stub(helix, 'storeAndBroadcast').yields(null, []);
            //     const getTransactionToApprove = sinon.stub(helix, 'getTransactionsToApprove').yields(null, {
            //         trunkTransaction: newValueAttachedTransactionBaseTrunk,
            //         branchTransaction: newValueAttachedTransactionBaseBranch,
            //     });

            //     return retryFailedTransaction()(failedTransactionsWithIncorrectTransactionHashes, seedStore).then(
            //         () => {
            //             expect(seedStore.performPow.callCount).to.equal(1);

            //             seedStore.performPow.restore();
            //             storeAndBroadcast.restore();
            //             getTransactionToApprove.restore();
            //         },
            //     );
            // });
        });

        describe('when any transaction object has an empty hash', () => {
            // it('should perform proof of work', () => {
            //     sinon.stub(seedStore, 'performPow').resolves({
            //         TxBytes: newValueAttachedTransactionBytes,
            //         transactionObjects: newValueAttachedTransaction,
            //     });

            //     const storeAndBroadcast = sinon.stub(helix, 'storeAndBroadcast').yields(null, []);
            //     const getTransactionToApprove = sinon.stub(helix, 'getTransactionsToApprove').yields(null, {
            //         trunkTransaction: newValueAttachedTransactionBaseTrunk,
            //         branchTransaction: newValueAttachedTransactionBaseBranch,
            //     });

            //     return retryFailedTransaction()(
            //         map(failedTransactionsWithCorrectTransactionHashes, (tx, idx) =>
            //             idx % 2 === 0 ? tx : Object.assign({}, tx, { hash: EMPTY_HASH_TXBYTES }),
            //         ),
            //         seedStore,
            //     ).then(() => {
            //         expect(seedStore.performPow.callCount).to.equal(1);

            //         seedStore.performPow.restore();
            //         storeAndBroadcast.restore();
            //         getTransactionToApprove.restore();
            //     });
            // });
        });
    });

    describe('#sortTransactionTxBytesArray', () => {
        // it('should sort transaction txBytes in ascending order', () => {
        //     // failedBytesWithCorrectTransactionHashes is in ascending order by default
        //     const txBytes = failedBytesWithCorrectTransactionHashes.slice().reverse();
        //     const result = sortTransactionTxBytesArray(txBytes, 'currentIndex', 'asc');

        //     expect(result).to.eql(failedBytesWithCorrectTransactionHashes);
        //     expect(asTransactionObjects(result[0], EMPTY_TRANSACTION_HEX).currentIndex).to.equal(0);
        // });

        // it('should sort transaction txBytes in descending order', () => {
        //     const txBytes = failedBytesWithCorrectTransactionHashes.slice().reverse();
        //     const result = sortTransactionTxBytesArray(txBytes);

        //     // failedBytesWithCorrectTransactionHashes is in ascending order by default to assert with a reversed list
        //     expect(result).to.eql(failedBytesWithCorrectTransactionHashes.slice().reverse());
        //     expect(hlx.utils.transactionObject(result[0], EMPTY_TRANSACTION_HEX).currentIndex).to.equal(2);
        // });
    });

    describe('#isValidTransfer', () => {
        let validTransfer;

        before(() => {
            validTransfer = {
                address: '3'.repeat(64),
                value: 10,
            };
        });

        describe('when transfer is not an object', () => {
            it('should return false', () => {
                [[], 0.1, 1, undefined, null, ''].forEach((item) => {
                    expect(isValidTransfer(item)).to.eql(false);
                });
            });
        });

        describe('when input is an object', () => {
            describe('when "address" is invalid is not valid txBytes', () => {
                it('should return false', () => {
                    const invalidAddress = `U${'a'.repeat(64)}`;

                    expect(isValidTransfer(assign({}, validTransfer, { address: invalidAddress }))).to.eql(false);
                });
            });

            describe('when "value" is not a number', () => {
                it('should return false', () => {
                    expect(isValidTransfer(assign({}, validTransfer, { value: undefined }))).to.eql(false);
                });
            });

            describe('when "value" is number and address is valid txBytes', () => {
                it('should return true', () => {
                    expect(isValidTransfer(validTransfer)).to.eql(true);
                });
            });
        });
    });

    describe('#isFundedBundle', () => {
        describe('when provided bundle is empty', () => {
            it('should throw with an error "Empty bundle provided"', () => {
                return isFundedBundle()([]).catch((err) => {
                    expect(err.message).to.equal('Empty bundle provided.');
                });
            });
        });

        describe('when provided bundle is not empty', () => {
            let bundle;

            before(() => {
                bundle = [
                    { address: 'a'.repeat(64), value: -10 },
                    { address: 'b'.repeat(64), value: 5 },
                    { address: 'c'.repeat(64), value: 5 },
                ];
            });

            describe('when total balance of bundle inputs is greater than latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-HELIX-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['3'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTransactionStrings: {
                                    TxBytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(false);
                    });
                });
            });

            describe('when total balance of bundle inputs is equal to latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-HELIX-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['10'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTransactionStrings: {
                                    TxBytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(true);
                    });
                });
            });

            describe('when total balance of bundle inputs is less than latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-HELIX-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['20'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTransactionStrings: {
                                    TxBytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(true);
                    });
                });
            });
        });
    });

    describe('#categoriseInclusionStatesByBundleHash', () => {
        describe('when size of first param does not equal size of second param', () => {
            it('should throw an error with message "Inclusion states size mismatch."', () => {
                try {
                    categoriseInclusionStatesByBundleHash([], [false, false]);
                } catch (error) {
                    expect(error.message).to.eql('Inclusion states size mismatch.');
                }
            });
        });

        describe('when size of first param equals size of second param', () => {
            it('should categorise inclusion states (passed as second param) by bundle hashes', () => {
                const tailTransactions = [
                    { bundle: 'a'.repeat(64) },
                    { bundle: 'a'.repeat(64) },
                    { bundle: 'b'.repeat(64) },
                    { bundle: 'c'.repeat(64) },
                    { bundle: 'a'.repeat(64) },
                    { bundle: 'b'.repeat(64) },
                ];

                const inclusionStates = [
                    false, // AAA
                    false, // AAA
                    false, // BBB
                    false, // CCC
                    true, // AAA
                    false, // BBB
                ];

                const result = categoriseInclusionStatesByBundleHash(tailTransactions, inclusionStates);
                expect(result).to.eql({
                    ['a'.repeat(64)]: true,
                    ['b'.repeat(64)]: false,
                    ['c'.repeat(64)]: false,
                });
            });
        });
    });

    describe('#assignInclusionStatesToBundles', () => {
        describe('when provided bundles is not an array', () => {
            it('should throw with an error "Invalid bundles provided."', () => {
                return assignInclusionStatesToBundles()(0)
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Invalid bundles provided.'));
            });
        });

        describe('when provided bundles is an empty array', () => {
            it('should return an empty array', () => {
                return assignInclusionStatesToBundles()([]).then((result) => expect(result).to.eql([]));
            });
        });

        describe('when provided bundles is not an empty array', () => {
            beforeEach(() => {
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
                        const resultMap = {
                            getNodeInfo: { latestSolidSubtangleMilestone: 'a'.repeat(64) },
                            // Return inclusion states as false for all tail transactions
                            getInclusionStates: { states: map(body.transactions, () => false) },
                        };

                        return resultMap[body.command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            // it('should assign correct inclusion state to each transaction in bundle', () => {
            //     return assignInclusionStatesToBundles()(confirmedValueBundles).then((updatedBundles) => {
            //         each(updatedBundles, (bundle) =>
            //             each(bundle, (transaction) => expect(transaction.persistence).to.equal(false)),
            //         );
            //     });
            // });
        });
    });

    describe('#filterZeroValueBundles', () => {
        // it('should filter zero value bundles', () => {
        //     const result = filterZeroValueBundles([
        //         ...confirmedValueBundles,
        //         ...unconfirmedValueBundles,
        //         ...confirmedZeroValueBundles,
        //     ]);

        //     const expectedResult = [...confirmedValueBundles, ...unconfirmedValueBundles];

        //     expect(result).to.eql(expectedResult);
        // });
    });

    describe('#isBundleTraversable', () => {
        let trunkTransaction;
        let branchTransaction;

        before(() => {
            // See trunk/branch transactions of newValueAttachedTransaction transaction object with currentIndex 2
            trunkTransaction = '009c7c8371e3c8cd5b36a438bb858812bbf308114b8018958075f8b7228df251';
            branchTransaction = '009c7c8371e3c8cd5b36a438bb858812bbf308114b8018958075f8b7228df251';
        });

        it('should return true for bundle with correct trunk/branch assignment', () => {
            expect(isBundleTraversable(newValueAttachedTransaction, trunkTransaction, branchTransaction)).to.equal(
                true,
            );
        });

        it('should return false for bundle with incorrect trunk/branch assignment', () => {
            expect(
                isBundleTraversable(
                    map(newValueAttachedTransaction, (transaction, index) =>
                        index % 2 === 0
                            ? {
                                ...transaction,
                                trunkTransaction: '0'.repeat(64),
                            }
                            : transaction,
                    ),
                ),
            ).to.equal(false);
        });
    });

    describe('#isBundle', () => {
        // it('should return true for valid bundle with incorrect (descending) transactions order', () => {
        //     expect(
        //         isBundle(
        //             // Transactions are in ascending order by default so reverse them.
        //             newValueAttachedTransaction.slice().reverse(),
        //         ),
        //     ).to.equal(true);
        // });

        // it('should return true for valid bundle with correct (ascending) transactions order', () => {
        //     expect(isBundle(newValueAttachedTransaction)).to.equal(true);
        // });

        // it('should return false for invalid bundle with incorrect (descending) transactions order', () => {
        //     expect(
        //         isBundle(
        //             // Transactions are in ascending order by default so reverse them.
        //             map(newValueAttachedTransaction, (transaction) => ({ ...transaction, bundle: '0'.repeat(64) }))
        //                 .slice()
        //                 .reverse(),
        //         ),
        //     ).to.equal(false);
        // });

        // it('should return false for invalid bundle with correct (ascending) transactions order', () => {
        //     expect(
        //         isBundle(
        //             map(newValueAttachedTransaction, (transaction) => ({ ...transaction, bundle: '0'.repeat(64) })),
        //         ),
        //     ).to.equal(false);
        // });
    });
});

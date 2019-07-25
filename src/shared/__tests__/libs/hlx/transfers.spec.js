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
    sortTransactionBytesArray,
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
} from '../../__samples__/bytes';
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
import { EMPTY_HASH_BYTES, EMPTY_TRANSACTION_BYTES, EMPTY_TRANSACTION_MESSAGE } from '../../../libs/hlx/utils';
import { IRI_API_VERSION } from '../../../config';
import {  isBundle as bundleValidator } from '@helixnetwork/bundle-validator';
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

        describe('when value is zero', () => {});

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
                            hash: 'KAQIKFPVUXRDXHHKYQHGMSMANNCANDWEJWZSDHVODXZJOEYFBXAAEXUKYUVYK9GFDOPPCXTYQLSUA9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 100,
                            obsoleteTag: 'WC9999999999999999999999999',
                            timestamp: 1540803186,
                            currentIndex: 0,
                            lastIndex: 1,
                            bundle: 'EOVVVSCLYEGBCO9HEUEBJLVBAQQDZLKEIUZXRZPFKESTSC9JNEVTVALLXUGRAZGTLFPFERSQHZWGLTQKW',
                            trunkTransaction:
                                'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            branchTransaction:
                                'MHOMYGDAUPMHXVOZYBALXQKKWVUINYM9AMAP9WTJVHVHCXISQOGMMTAERKSWZQYHEGCUJA9HUZLBA9999',
                            tag: 'WC9999999999999999999999999',
                            attachmentTimestamp: 1540803203768,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'IDYW9HSKDJWSKORKXPTKSYAMTMG',
                        },
                        {
                            hash: 'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            signatureMessageFragment:
                                'MREUITP9DQMWAXXXWBGRDDHJVBMXRDEODKYVLTBHQARMRJYA9O9ZKLRRCVIBVBYGFRMENELIWCHGRWHDWC9IYSUXRGSZPLSNXECOWLGOUVBM9E9UGPB9HGHJRQHNEEBQEZ9IHGZLLBTZHTYNQTLGSTSBGZYKPWFWPAECXYVUML9AAJ9EHJDMSUYYBXLSWEIOGOYMJJBFPAHSMUGTXTSVWMJZKPETJXDUIECVVEAKVOEOIGBOBZCZZYMYSYCOCRJK9QJHPUMCNUDMSBWJJGDDFEIAKPERCLOHCHDFDZGQXX9GYWLOUIOPYILDTVFFOXKQY9BBQWMN9CDQTEPOIQEQABRLDIUEKMIOYFNAEGIXVAICYYYWNX9M9NO9GFAHHW9FR9QCERUHQQMIJOKXDPXOBOAYOAMXSZ9ZO9MEWACERFE9RQVBHKVJML9LBYLTORUADKIBREPZCKBVFQACWFVSSUICNSMGANTYAYXJFZAC9ROVGCUBYZBNRSURFWDLQMPZXJNEUJKXWSKNB9OCCI9BLHNUZWREJGGXQBEBNMHRHTNABQB9OBOWHBWKNJQDXJSTGPSJE9CZMRPFYFSPXHWTWSPXCFODLUZPHUTORUQZJKQHXPHYGMJTREMGPDDGAPGMJVTTDECDOUIDQVCJSQFSDWDRK9ITIEPQKFXQZHAXUIAIIITXZTLZDATGJC9AFEAMLTZAKXXYZYSVBRVQXJ9MSIRZBDMQQBXYIGXNQKONJHUUDAJLROAQPS9SCQNDIGSDYFGRWXDQHOISHSRZUSRRCXORVOUQMCNQJJETK9IBIWERKTSFAHXZWEIYQBOTYGYQYYB9KXZSNYFMAETOSIHLZLFXAIIEDERA9UHFHTJIBPNPXSKCMLC9ACPORY9VDKRIWJPEYE9NYCJPKDTMASMJPXU9WEBYZNKHXVXU9QP9DSEGIUGFQJTFFUHYZZNVYTNGPDQJALDQDKJZZJLISGFYQAEJARGKRYSGOBYKYHRYJJMNDVGHLGYXXSGULPAUF9VAMZCFBYLSZWDYFKZX99SDTWIKHTNSDMKGUGMTVWJZRUTTXLHSWEAMMYDKC9JEIYUJDSSQCSCWUACHPYSOLGRWKOYW9NTUQBERDOWNWYGONHHRNWYZKYOQVX9XTTYRZAUIXNAIRCCHWHVOTSYZNTOIZXNUGJQZUBIXPVMHJGHXNCTWZRYOBNAZOOWFGIVYUJWVGBWRVCOILQGRIGABMON9QJZEUNFRDOROAV9DRBDXBHQYWWZHQDLRJAX9IJJTTGRFBVZIEFYVICXQFPYYCUJBHWZETE9VAPJLPJFODTMNEXUKAUUBTLQTWQFIROOUTBZFNNJ9QOIJPXRCJDCOZPIQLQQDYTGKDHUJWQPNYXVKJX9MQUTTEDFJWBQYKQMZLYU9HUKXI9DA9TIOCBTCFUMPOIGBAJDSMUXKDLN9DLXXJJDOKYYMSWUICIGOTEPQPCUNTZHDXUVGRFQLUYZFOTG9VQBNIYVKGENLYNDUEZVHRTSSVWLWPIUJJXCAOMBFQIEYWEBXSNEYGFNBRRAE9V9OOIZJRONIUHJCZUIVPNCWCGKEFKGDDEJWGVOKTDLKYKNMGZYYGOSBVWLJDSVRQAFCELYJROLAKHBD9CG9HIROCZSPWLTA9EUQLPZTM9BWQPA9XQOMDZWZOQQUKODQEOKVNHNSI9DTWNNVCFQCXDGSPBXWAYYMPMDE9IDZIRBN9JOYBDPSYLMMCUZIHCWKRJYMRCSNMZEEIHMPC9SAQFTSHRGNJB9BFSJLPZY9VQEXUNSDW9FOZ9JLEUONFSXJJJFWJTPSTFHNRJPIEVSUYLOTEWWRVFVZZPTBLMLHRKTMYQPSIXSX9GWSXZIPTUMXAPWAVWNUYAVNBGQVSHWYHA9WQXWXGXWDMIGWAQOPUNTRKVTZLMGSLWALLBDLVFE9KJQRHBDZMLSQOGAFUFCDKGPJJOEBQDNFK9HPVTUWMWFOCXZVOACFSKY9PBBFBOXRGTRKJQUWP9EFDRFCFNRZEZOMBALU9GNFUAGWMKRJXYAFJIZEVUKWJYGSMCSRCJCV9ZBOURCCO9KMNFMRROPQMVYSRRYIZLOEDYBKMAVOYANVJWLNJQLXPVVFTBDCRV9CPZUQJNNJYLOWCXJAGJDWNDCGNYVJEJVGDRV9CFQKBKEY9PFGHCAIHYKAPDX',
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803186,
                            currentIndex: 1,
                            lastIndex: 1,
                            bundle: 'EOVVVSCLYEGBCO9HEUEBJLVBAQQDZLKEIUZXRZPFKESTSC9JNEVTVALLXUGRAZGTLFPFERSQHZWGLTQKW',
                            trunkTransaction:
                                'MHOMYGDAUPMHXVOZYBALXQKKWVUINYM9AMAP9WTJVHVHCXISQOGMMTAERKSWZQYHEGCUJA9HUZLBA9999',
                            branchTransaction:
                                'JQPGGGY9CXUGFUG9KQJOBJCNBWO9BVRGQOGHALZEFFDJWEMZVWFXBGJULIALYCOQRDCAA9JRGGAXZ9999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803191223,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: '9XKCYTYWAQYVJJCI9ACUBOEAT9H',
                        },
                    ],
                    inputs: [
                        {
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            hash: 'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            currentIndex: 1,
                            lastIndex: 1,
                            checksum: 'NMSVFUQPW',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 100,
                            hash: 'KAQIKFPVUXRDXHHKYQHGMSMANNCANDWEJWZSDHVODXZJOEYFBXAAEXUKYUVYK9GFDOPPCXTYQLSUA9999',
                            currentIndex: 0,
                            lastIndex: 1,
                            checksum: 'GI9KMCCEC',
                        },
                    ],
                },
                zeroValueTransactions: {
                    bundle: [
                        {
                            hash: 'WNFESDTEFDS9CCVAERQNJXPZJWPRQTJJQAC9ITFQXRFSLVLBKJEOGVHQ9QBJZITFLGXNRA9QMJNEA9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 0,
                            obsoleteTag: 'XE9999999999999999999999999',
                            timestamp: 1540803317,
                            currentIndex: 0,
                            lastIndex: 0,
                            bundle: 'BBI99KUREFBJXE9SFBECRPBQQYIBLLWLKZ9KDASSACTJBPFDXQJVZUUD9UUBXSHBV9FRJJFKLTUEAHPBW',
                            trunkTransaction:
                                'BTL9BMLUYGNLODQCQWTYKVLVYCPYZBCURCROIVUQWTSLJTAVKAEEWMZQFJDXUWLQX99K9RUMGNZQZ9999',
                            branchTransaction:
                                'OCVRFBRUDUUYXMSTQRGHLUHWBPHVTGNAOOBBMHUOUWBUFJJKXDKGJCGYSPFOCFAFR9VMETXVZVGBZ9999',
                            tag: 'XE9999999999999999999999999',
                            attachmentTimestamp: 1540803321789,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'ZMJNGH9M9RMLZKRUPXBOTZPPSCA',
                        },
                    ],
                    inputs: [],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 0,
                            hash: 'WNFESDTEFDS9CCVAERQNJXPZJWPRQTJJQAC9ITFQXRFSLVLBKJEOGVHQ9QBJZITFLGXNRA9QMJNEA9999',
                            currentIndex: 0,
                            lastIndex: 0,
                            checksum: 'GI9KMCCEC',
                        },
                    ],
                },
                valueTransactionsWithRemainder: {
                    bundle: [
                        {
                            hash: 'EHFGMUTRBYTU9IFAABLEUQYJJAFBERNPUCVIJEXGOHCBQAIZLWTGJOBVDGLPUEPSG9AGQSZLUOQO99999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 10,
                            obsoleteTag: 'SA9999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 0,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            branchTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            tag: 'SA9999999999999999999999999',
                            attachmentTimestamp: 1540803394274,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'PFZMLBKWXIPLFFSMSTU9CUIWUXC',
                        },
                        {
                            hash: 'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            signatureMessageFragment:
                                'XFVWFVDSKVVNLDOVDECSNRLJZQRYFPGXWAUDSDKMTGNXLMKP9DXLUCKZEISULSLUCRDODPFWXFQMGCKMZRND9NTO9JQDSBQCCSQOTJEYWJXYHWFQACUXNTPHBZSZCKEROTDJKOEMONALAVRWV9SUUHWMNKUQOVMGQYFVHPYRZYTWTFQPOCQUNRECUZBKYMEMOLUIOGP9JBFGALEPZDEYMCUCYALC9PYLOKVFYFMJJWIJ9LUGOAYVFAABTSQQOLWUQYKKRHFSRATHR9XGQDJNBYFSLNENNVRYLJHRPNZJXPMUSXYGJVZJHJEFQBOCJBWYTBLXVFFEHNMPZQDJUGCFWEJXRJBZKQKZW9HLRV9VZDLCV9DYKDWXWXZJEILMOECZKJLLHISWYNDFLEOSCEHQWRQWKZOHEIRBCJOEWDAWUPNVHYFQPDSZXGLXGGFQI9JEKIY9KHQOMAOHVDYPGVQLZUUTMGNOBCKKB9JCTDQUSCHAMKPHXJDMXKIXKRBFTMTOMYVPRILSYTFRECJAFVSULZQQSZRMPBNGFOGCSMXDWYSNRQIUQL9ZOTAYNUYGICJOIFPQOQCSBDEHJZLSLRAOIU9ZMTKWHREOTKSGEOUGTVUQBV9SHSAUQ9UGRHIENULXUQCMPQXDLLLBAJHJIMVSZ9XTAWEHWMLLIVHYAIKWQFY9GEXGPR9RNDTIDFDNVGJZGGYBTLXMUPMDQG9PWIFNIOHHYPQSEXIOFKBNHPSOBTYNYPSDAUPSBKILOA9GECKZQYTJO9SZFTSVRLLGPOBEDNRKZPBZEPWTKTSCADTGJDRYWFVOAG9IEJQORZPPPMGCBAHKUHADDRKMSUVQS9QAQJDDZAZLGVRY9PQWRJMWASUAMLGEZLLSYTYYAODVAOMHEERESXFMQZNVKEITQSZQUILQOXPBSBRVHMMLIPRPLUNJZONTLDWCTADHRFWEBIUWTIEBNISGFJKDBGJ9DDULEKXMFI9BDWOSCLWODMUVQOJKFMBCWMMVJ9YCALQLCQPPDNWD9VBMBDJEOCUIVOWRRFLATDKEBDXITIMYCMGWIWGZDTLBQBSTPNCDZZXFCHNADJDQETWMPABDDTOQFBVTJBAWSRJZVBHRCCJOQHBJDGJE9ZZREQQZUQEOOVAQJKJILFTUQXTXIKQADEHNGGSGONTLGMGN9KYOMAVDVYSSCGPT9QTZTVF9VLFNKJDEFQWTZTLV9ZZRNOIN9OQZHJHFIOZXYKMPLXNNSUEOQFU9FPUAADCEFHBAA9QHLIDQG9V9HSLMZYIJXVJNJ9M9CJBCKQKOFGCLNYDZ9YLB9GYDT9QELNVPBQFESBJTWBWKVVUNHOSIPNXHTMBBN9JCMSRWPFT9LBOCSQXACLSMDTELCWQUXFKIXNOWMRKIDIUDATBPUMFILVWRVOPALPALREQKKSREIJFSWLTPDOXEYSCGZUZ9IEAHPXCWGUVANEG9VYUQQORYFMEMGVDIURCNRCCACMOIL9LAZUYLXWILEHZOPLJRBWFKATUKFRGDNGTYIGFCZJDUGXPYUHUDHPGFSVUSEYDQJUJCPUSBJGJIWOKHGYOOIX99IRWCJXLBAUPZVISTDAUASWFNMFUPIGIWURFCXPKOIDTX9MQOSTGCCRJCYIWIVZHSVRI9PIXTLYKBJZGSLAKVTXMQSOLGFDEUPYFDEDCDTPJHHSJFMINQXBQBASKKWOXIDZVGTOYJXAOFVPYPIJX9QRJDVFTKRFMDDDRJNUJAISRNGS9CXZJFCEIDHEJONLMJAAYWE9LPWAI9QQHHP9YIIVVKOYYMHNUZFYOVHEDGLYZUEUHWUZKWY9FOA9WDLIHZHLWZRIWEUYRXSRXIAVPSWDDMMAOQARUWXYWRCMINHSYEIKRJQRWWAHLFTINSNQHRAHSVLUGRYHPRYKLKRXYJUCQGSFRQFFEMVLRCKAAD9NSGOUYRYPXYWLFNXSNLXFZA9NQPAL9YOWMPOOQCTQLSJXMWCUQSDIU9AZSUVFMKWNRNXCHHQXOOLHUFDQNNINSWZDWYVKTECEZ9INRPHVHTQIHTUEEKNWFLLDVSOXIVVV9LDFEJHBKONGAWO9VHGACHSILXVJFJMDWSLZXVJZYEFGKJILYX9LAPCUXMBIHZYISWDGLUAGEWOSSNYNPEWYGSKVFZXGO9MXDVFIHSANVJKJKVBXW',
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 1,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            branchTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803393849,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'ZJ9XPSMFEDMDVJCIVMVULRKY9ZX',
                        },
                        {
                            hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                            value: 90,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 2,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            branchTransaction:
                                'PU9KWOIEMHWEVWIDUJFCYOEACKVECOSMSOODZ9VKMHMRMRXSUMIFVKNIJZAQOYOVCYYLCGWPBPVUZ9999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803390126,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'EV9GTWIUSUCXQJBCQMEKPYREQHZ',
                        },
                    ],
                    inputs: [
                        {
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            hash: 'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            currentIndex: 1,
                            lastIndex: 2,
                            checksum: 'NMSVFUQPW',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 10,
                            hash: 'EHFGMUTRBYTU9IFAABLEUQYJJAFBERNPUCVIJEXGOHCBQAIZLWTGJOBVDGLPUEPSG9AGQSZLUOQO99999',
                            currentIndex: 0,
                            lastIndex: 2,
                            checksum: 'GI9KMCCEC',
                        },
                        {
                            address:
                                'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                            value: 90,
                            hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            currentIndex: 2,
                            lastIndex: 2,
                            checksum: 'LMGZQSHFB',
                        },
                    ],
                },
            };
        });

        describe('when transaction object has a negative value', () => {
            // it('should categorise as "inputs"', () => {
            //     for (const prop in bundlesMap) {
            //         const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], 1);

            //         expect(result.inputs).to.eql(bundlesMap[prop].inputs);
            //     }
            // });
        });

        describe('when transaction object has a non-negative value', () => {
            describe('when outputs size is less than outputs threshold', () => {
                // it('should categorise as "outputs"', () => {
                //     const outputsThreshold = 4;

                //     for (const prop in bundlesMap) {
                //         const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], outputsThreshold);

                //         expect(result.outputs).to.eql(bundlesMap[prop].outputs);
                //     }
                // });
            });

            describe('when outputs size is greater than outputs threshold', () => {
                // it('should filter outputs with unknown addresses', () => {
                //     const {
                //         valueTransactionsWithNoRemainder: { bundle },
                //     } = bundlesMap;
                //     const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                //     expect(result.outputs).to.eql([]);
                // });

                // it('should not filter remainder outputs', () => {
                //     const {
                //         valueTransactionsWithRemainder: { bundle },
                //     } = bundlesMap;
                //     const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                //     expect(result.outputs).to.eql([
                //         {
                //             address:
                //                 'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                //             value: 90,
                //             hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                //             currentIndex: 2,
                //             lastIndex: 2,
                //             checksum: 'LMGZQSHFB',
                //         },
                //     ]);
                // });
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
                // it('should call proof-of-work function with bytes, trunk, branch and minWeightMagnitude', () => {
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

            digestFn = (bytes) => Promise.resolve(asTransactionObject(bytes).hash);

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
                performPow: (bytes) =>
                    Promise.resolve({
                        bytes,
                        transactionObjects: map(bytes, asTransactionObject),
                    }),
                getDigest: (bytes) => Promise.resolve(asTransactionObject(bytes).hash),
            };
        });

        describe('when all transaction objects have valid hash', () => {
            // it('should not perform proof of work', () => {
            //     sinon.stub(seedStore, 'performPow').resolves({
            //         hbytes: failedBytesWithCorrectTransactionHashes,
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
            //         hbytes: newValueAttachedTransactionBytes,
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
            //         hbytes: newValueAttachedTransactionBytes,
            //         transactionObjects: newValueAttachedTransaction,
            //     });

            //     const storeAndBroadcast = sinon.stub(helix, 'storeAndBroadcast').yields(null, []);
            //     const getTransactionToApprove = sinon.stub(helix, 'getTransactionsToApprove').yields(null, {
            //         trunkTransaction: newValueAttachedTransactionBaseTrunk,
            //         branchTransaction: newValueAttachedTransactionBaseBranch,
            //     });

            //     return retryFailedTransaction()(
            //         map(failedTransactionsWithCorrectTransactionHashes, (tx, idx) =>
            //             idx % 2 === 0 ? tx : Object.assign({}, tx, { hash: EMPTY_HASH_BYTES }),
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

    describe('#sortTransactionBytesArray', () => {
        // it('should sort transaction bytes in ascending order', () => {
        //     // failedBytesWithCorrectTransactionHashes is in ascending order by default
        //     const bytes = failedBytesWithCorrectTransactionHashes.slice().reverse();
        //     const result = sortTransactionBytesArray(bytes, 'currentIndex', 'asc');

        //     expect(result).to.eql(failedBytesWithCorrectTransactionHashes);
        //     expect(asTransactionObjects(result[0], EMPTY_TRANSACTION_BYTES).currentIndex).to.equal(0);
        // });

        // it('should sort transaction bytes in descending order', () => {
        //     const bytes = failedBytesWithCorrectTransactionHashes.slice().reverse();
        //     const result = sortTransactionBytesArray(bytes);

        //     // failedBytesWithCorrectTransactionHashes is in ascending order by default to assert with a reversed list
        //     expect(result).to.eql(failedBytesWithCorrectTransactionHashes.slice().reverse());
        //     expect(iota.utils.transactionObject(result[0], EMPTY_TRANSACTION_BYTES).currentIndex).to.equal(2);
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
            describe('when "address" is invalid is not valid bytes', () => {
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

            describe('when "value" is number and address is valid bytes', () => {
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
                                getHBytes: {
                                    hbytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_BYTES),
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
                                getHBytes: {
                                    hbytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_BYTES),
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
                                getHBytes: {
                                    hbytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_BYTES),
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

        // it('should return true for bundle with correct trunk/branch assignment', () => {
        //     expect(isBundleTraversable(newValueAttachedTransaction, trunkTransaction, branchTransaction)).to.equal(
        //         true,
        //     );
        // });

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

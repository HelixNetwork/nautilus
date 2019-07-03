import head  from 'lodash/head';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import { expect } from 'chai';
import nock from 'nock';
import { asTransactionHBytes , asTransactionObject } from "@helixnetwork/transaction-converter";
import { getHelixInstance, isNodeHealthy, allowsRemotePow } from '../../../libs/hlx/extendedApi';
import { helix } from '../../../libs/hlx/index';
import { newZeroValueTransactionBytes } from '../../__samples__/bytes';
import { EMPTY_HASH_BYTES } from '../../../libs/hlx/utils';
import { IRI_API_VERSION, MAX_MILESTONE_FALLBEHIND } from '../../../config';

describe('libs: helix/extendedApi', () => {
    describe('#getHelixInstance', () => {
        describe('when settings object { url, token?, password? } is passed as an argument', () => {
            it('should not return global helix instance', () => {
                const instance = getHelixInstance({ url: 'http://foo.baz' });
                expect(isEqual(instance, helix)).to.equal(false);
            });
        });

        describe('when settings object { url, token?, password? } is not passed as an argument', () => {
            it('should return global helix instance', () => {
                const instance = getHelixInstance();
                expect(isEqual(instance, helix)).to.equal(true);
            });
        });
    });

    describe('#isNodeHealthy', () => {
        describe('when node runs an unsupported release', () => {
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
                        const { command } = body;

                        const resultMap = {
                            getNodeInfo: {
                                appVersion: '0.0.0-RC2',
                            },
                        };

                        return resultMap[command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should throw with an error "Node version not supported"', () => {
                return isNodeHealthy()
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Node version not supported'));
            });
        });

        describe('when latestMilestone is not equal to latestSolidSubtangleMilestone', () => {
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
                        const { command } = body;

                        const resultMap = {
                            getNodeInfo: {
                                appVersion: '0.0.0',
                                latestMilestone: EMPTY_HASH_BYTES,
                                latestSolidSubtangleMilestone: 'U'.repeat(81),
                            },
                        };

                        return resultMap[command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeHealthy()
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latestMilestone is ${EMPTY_HASH_BYTES}`, () => {
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
                        const { command } = body;

                        const resultMap = {
                            getNodeInfo: {
                                appVersion: '0.0.0',
                                latestMilestone: EMPTY_HASH_BYTES,
                                latestSolidSubtangleMilestone: EMPTY_HASH_BYTES,
                            },
                        };

                        return resultMap[command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeHealthy()
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latestSolidSubtangleMilestoneIndex is ${MAX_MILESTONE_FALLBEHIND} less than latestMilestoneIndex`, () => {
            describe('when "timestamp" on bytes is from five minutes ago', () => {
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
                            const { command } = body;

                            const resultMap = {
                                getNodeInfo: {
                                    appVersion: '0.0.0',
                                    latestMilestoneIndex: 426550,
                                    latestSolidSubtangleMilestoneIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                    latestMilestone: '0'.repeat(64),
                                    latestSolidSubtangleMilestone: 'a'.repeat(64),
                                },
                                getBytes: { bytes: [head(newZeroValueTransactionBytes)] },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(false));
                });
            });

//             describe('when "timestamp" on bytes is within five minutes', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             const resultMap = {
//                                 getNodeInfo: {
//                                     appVersion: '0.0.0',
//                                     latestMilestoneIndex: 426550,
//                                     latestSolidSubtangleMilestoneIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
//                                     latestMilestone: 'U'.repeat(81),
//                                     latestSolidSubtangleMilestone: 'A'.repeat(81),
//                                 },
//                                 getTrytes: {
//                                     trytes: [
//                                         head(
//                                             map(newZeroValueTransactionBytes, (tryteString) => {
//                                                 const transactionObject = asTransactionObject(tryteString);
//                                                 const timestampLessThanAMinuteAgo = Date.now() - 60000;

//                                                 return asTransactionHBytes({
//                                                     ...transactionObject,
//                                                     timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
//                                                 });
//                                             }),
//                                         ),
//                                     ],
//                                 },
//                             };

//                             return resultMap[command] || {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return true if "timestamp" on trytes is within five minutes', () => {
//                     return isNodeHealthy().then((result) => expect(result).to.equal(true));
//                 });
//             });
//         });

//         describe(`when latestSolidSubtangleMilestoneIndex is ${MAX_MILESTONE_FALLBEHIND -
//             1} less than latestMilestoneIndex`, () => {
//             describe('when "timestamp" on trytes is from five minutes ago', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             const resultMap = {
//                                 getNodeInfo: {
//                                     appVersion: '0.0.0',
//                                     latestMilestoneIndex: 426550,
//                                     latestSolidSubtangleMilestoneIndex: 426550 - (MAX_MILESTONE_FALLBEHIND - 1),
//                                     latestMilestone: 'U'.repeat(81),
//                                     latestSolidSubtangleMilestone: 'A'.repeat(81),
//                                 },
//                                 getTrytes: { trytes: [head(newZeroValueTransactionBytes)] },
//                             };

//                             return resultMap[command] || {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return false', () => {
//                     return isNodeHealthy().then((result) => expect(result).to.equal(false));
//                 });
//             });

//             describe('when "timestamp" on trytes is within five minutes', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             const resultMap = {
//                                 getNodeInfo: {
//                                     appVersion: '0.0.0',
//                                     latestMilestoneIndex: 426550,
//                                     latestSolidSubtangleMilestoneIndex: 426550 - (MAX_MILESTONE_FALLBEHIND - 1),
//                                     latestMilestone: 'U'.repeat(81),
//                                     latestSolidSubtangleMilestone: 'A'.repeat(81),
//                                 },
//                                 getTrytes: {
//                                     trytes: [
//                                         head(
//                                             map(newZeroValueTransactionBytes, (tryteString) => {
//                                                 const transactionObject = asTransactionObject(tryteString);
//                                                 const timestampLessThanAMinuteAgo = Date.now() - 60000;

//                                                 return asTransactionHBytes({
//                                                     ...transactionObject,
//                                                     timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
//                                                 });
//                                             }),
//                                         ),
//                                     ],
//                                 },
//                             };

//                             return resultMap[command] || {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return true if "timestamp" on trytes is within five minutes', () => {
//                     return isNodeHealthy().then((result) => expect(result).to.equal(true));
//                 });
//             });
//         });

//         describe(`when latestMilestone is not ${EMPTY_HASH_BYTES} and is equal to latestSolidSubtangleMilestone`, () => {
//             describe('when "timestamp" on trytes is from five minutes ago', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             const resultMap = {
//                                 getNodeInfo: {
//                                     appVersion: '0.0.0',
//                                     latestMilestone: 'U'.repeat(81),
//                                     latestSolidSubtangleMilestone: 'U'.repeat(81),
//                                 },
//                                 getTrytes: { trytes: [head(newZeroValueTransactionBytes)] },
//                             };

//                             return resultMap[command] || {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return false', () => {
//                     return isNodeHealthy().then((result) => expect(result).to.equal(false));
//                 });
//             });

//             describe('when "timestamp" on trytes is within five minutes', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             const resultMap = {
//                                 getNodeInfo: {
//                                     appVersion: '0.0.0',
//                                     latestMilestone: 'U'.repeat(81),
//                                     latestSolidSubtangleMilestone: 'U'.repeat(81),
//                                 },
//                                 getTrytes: {
//                                     trytes: [
//                                         head(
//                                             map(newZeroValueTransactionBytes, (tryteString) => {
//                                                 const transactionObject = asTransactionObject(tryteString);
//                                                 const timestampLessThanAMinuteAgo = Date.now() - 60000;

//                                                 return asTransactionHBytes({
//                                                     ...transactionObject,
//                                                     timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
//                                                 });
//                                             }),
//                                         ),
//                                     ],
//                                 },
//                             };

//                             return resultMap[command] || {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return true', () => {
//                     return isNodeHealthy().then((result) => expect(result).to.equal(true));
//                 });
//             });
//         });
//     });

//     describe('#allowsRemotePow', () => {
//         describe('when has updated IRI version (version that has "features" prop in nodeInfo)', () => {
//             describe('when has listed "RemotePOW" as a feature', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             if (command === 'getNodeInfo') {
//                                 return {
//                                     features: ['RemotePOW', 'zeroMessageQueue'],
//                                 };
//                             }

//                             return {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return true', () => {
//                     return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(true));
//                 });
//             });

//             describe('when has not listed "RemotePOW" as a feature', () => {
//                 beforeEach(() => {
//                     nock('http://localhost:14265', {
//                         reqheaders: {
//                             'Content-Type': 'application/json',
//                             'X-IOTA-API-Version': IRI_API_VERSION,
//                         },
//                     })
//                         .filteringRequestBody(() => '*')
//                         .persist()
//                         .post('/', '*')
//                         .reply(200, (_, body) => {
//                             const { command } = body;

//                             if (command === 'getNodeInfo') {
//                                 return {
//                                     features: ['zeroMessageQueue'],
//                                 };
//                             }

//                             return {};
//                         });
//                 });

//                 afterEach(() => {
//                     nock.cleanAll();
//                 });

//                 it('should return false', () => {
//                     return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(false));
//                 });
//             });
        });
    });
});

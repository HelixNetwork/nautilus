import head from 'lodash/head';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import { expect } from 'chai';
import nock from 'nock';
import { asTransactionStrings, asTransactionObject } from '@helixnetwork/transaction-converter';
import { getHelixInstance, isNodeHealthy, allowsRemotePow } from '../../../libs/hlx/extendedApi';
import { helix } from '../../../libs/hlx/index';
import { newZeroValueTransactionBytes } from '../../__samples__/txBytes';
import { EMPTY_HASH_TXBYTES } from '../../../libs/hlx/utils';
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
                                currentRoundIndex: 426550,
                                latestSolidRoundHash: EMPTY_HASH_TXBYTES,
                                latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                roundStartIndex: 0,
                                lastSnapshottedRoundIndex: 420000,
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

        describe(`when latestMilestone is ${EMPTY_HASH_TXBYTES}`, () => {
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
                                currentRoundIndex: 426550,
                                latestSolidRoundHash: EMPTY_HASH_TXBYTES,
                                latestSolidRoundIndex: 0,
                                roundStartIndex: 0,
                                lastSnapshottedRoundIndex: 420000,
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

        describe(`when latestSolidRoundIndex is ${MAX_MILESTONE_FALLBEHIND} less than currentRoundIndex`, () => {
            describe('when "timestamp" on txBytes is from five minutes ago', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                    latestSolidRoundIndex: 426550 - 100,
                                    roundStartIndex: 0,
                                    lastSnapshottedRoundIndex: 420000,
                                },
                                getTransactionStrings: {
                                    txs: [head(newZeroValueTransactionBytes)],
                                },
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

            describe('when "timestamp" on txBytes is within five minutes', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                    latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                    roundStartIndex: 0,
                                    lastSnapshottedRoundIndex: 420000,
                                },
                                getTransactionStrings: {
                                    txs: [
                                        head(
                                            map(newZeroValueTransactionBytes, (byteString) => {
                                                const transactionObject = asTransactionObject(byteString);
                                                const timestampLessThanAMinuteAgo = Date.now() - 60000;

                                                return asTransactionStrings({
                                                    ...transactionObject,
                                                    timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
                                                });
                                            }),
                                        ),
                                    ],
                                },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true if "timestamp" on txBytes is within five minutes', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(true));
                });
            });
        });

        describe(`when latestSolidSubtangleMilestoneIndex is ${MAX_MILESTONE_FALLBEHIND -
            1} less than latestMilestoneIndex`, () => {
            describe('when "timestamp" on txBytes is from five minutes ago', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                    latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                    roundStartIndex: 0,
                                    lastSnapshottedRoundIndex: 420000,
                                },
                                getTransactionStrings: {
                                    txs: [head(newZeroValueTransactionBytes)],
                                },
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

            describe('when "timestamp" on txBytes is within five minutes', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                    latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                    roundStartIndex: 0,
                                    lastSnapshottedRoundIndex: 420000,
                                },
                                getTransactionStrings: {
                                    txs: [
                                        head(
                                            map(newZeroValueTransactionBytes, (TxByteString) => {
                                                const transactionObject = asTransactionObject(TxByteString);
                                                const timestampLessThanAMinuteAgo = Date.now() - 60000;

                                                return asTransactionStrings({
                                                    ...transactionObject,
                                                    timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
                                                });
                                            }),
                                        ),
                                    ],
                                },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true if "timestamp" on txBytes is within five minutes', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(true));
                });
            });
        });

        describe(`when latestMilestone is not ${EMPTY_HASH_TXBYTES} and is equal to latestSolidSubtangleMilestone`, () => {
            describe('when "timestamp" on txBytes is from five minutes ago', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                },
                                getTransactionStrings: {
                                    txs: [head(newZeroValueTransactionBytes)],
                                },
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

            describe('when "timestamp" on txBytes is within five minutes', () => {
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
                                    currentRoundIndex: 426550,
                                    latestSolidRoundHash: 'c'.repeat(64),
                                    latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND,
                                    roundStartIndex: 0,
                                    lastSnapshottedRoundIndex: 420000,
                                },
                                getTransactionStrings: {
                                    txs: [
                                        head(
                                            map(newZeroValueTransactionBytes, (bytesString) => {
                                                const transactionObject = asTransactionObject(bytesString);
                                                const timestampLessThanAMinuteAgo = Date.now() - 60000;

                                                return asTransactionStrings({
                                                    ...transactionObject,
                                                    timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
                                                });
                                            }),
                                        ),
                                    ],
                                },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(true));
                });
            });
        });
    });

    describe('#allowsRemotePow', () => {
        describe('when has updated IRI version (version that has "features" prop in nodeInfo)', () => {
            describe('when has listed "RemotePOW" as a feature', () => {
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
                            if (command === 'getNodeInfo') {
                                return {
                                    features: ['RemotePOW', 'zeroMessageQueue'],
                                };
                            }

                            return {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(true));
                });
            });

            describe('when has not listed "RemotePOW" as a feature', () => {
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

                            if (command === 'getNodeInfo') {
                                return {
                                    features: ['zeroMessageQueue'],
                                };
                            }

                            return {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(false));
                });
            });
        });
    });
});

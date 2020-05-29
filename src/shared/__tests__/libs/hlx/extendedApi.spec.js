import isEqual from 'lodash/isEqual';
import { expect } from 'chai';
import nock from 'nock';
import { getHelixInstance, isNodeHealthy, allowsRemotePow } from '../../../libs/hlx/extendedApi';
import { helix } from '../../../libs/hlx/index';
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

        describe(`when currentRoundIndex-latestSolidRoundIndex is not less than or equal to ${MAX_MILESTONE_FALLBEHIND}`, () => {
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
                                latestSolidRoundIndex: 426499,
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

        describe('when latestSolidRoundIndex is 0', () => {
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

        describe('when latestSolidRoundIndex is greater than currentRoundIndex', () => {
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
                                latestSolidRoundIndex: 426551,
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

            it('should return false', () => {
                return isNodeHealthy().catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latest solidround  is within ${MAX_MILESTONE_FALLBEHIND} rounds`, () => {
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
                                latestSolidRoundIndex: 426550 - MAX_MILESTONE_FALLBEHIND + 1,
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

            it(`should return true if cuurentround -latestSolidRound is within ${MAX_MILESTONE_FALLBEHIND} `, () => {
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

import get from 'lodash/get';
import head from 'lodash/head';
import has from 'lodash/has';
import includes from 'lodash/includes';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import { composeAPI } from '@helixnetwork/core';
import { helix, quorum } from './index';
import Errors from '../errors';
import { isWithinMinutes } from '../date';
import {
    DEFAULT_BALANCES_THRESHOLD,
    DEFAULT_DEPTH,
    DEFAULT_MIN_WEIGHT_MAGNITUDE,
    DEFAULT_NODE_REQUEST_TIMEOUT,
    GET_NODE_INFO_REQUEST_TIMEOUT,
    WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT,
    GET_BALANCES_REQUEST_TIMEOUT,
    ATTACH_TO_TANGLE_REQUEST_TIMEOUT,
    GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT,
    IRI_API_VERSION,
    MAX_MILESTONE_FALLBEHIND,
} from '../../config';
import {
    sortTransactionTrytesArray,
    constructBundleFromAttachedTrytes,
    isBundle,
    isBundleTraversable,
} from './transfers';
import { EMPTY_HASH_BYTES, withRequestTimeoutsHandler } from './utils';

/**
 * Returns timeouts for specific quorum requests
 *
 * @method getApiTimeout
 * @param {string} method
 * @param {array} [payload]

 * @returns {number}
 */
/* eslint-disable no-unused-vars */
const getApiTimeout = (method, payload) => {
    /* eslint-enable no-unused-vars */
    switch (method) {
        case 'wereAddressesSpentFrom':
            return WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT;
        case 'getBalances':
            return GET_BALANCES_REQUEST_TIMEOUT;
        case 'getNodeInfo':
            return GET_NODE_INFO_REQUEST_TIMEOUT;
        case 'attachToTangle':
            return ATTACH_TO_TANGLE_REQUEST_TIMEOUT;
        case 'getTransactionsToApprove':
            return GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT;
        default:
            return DEFAULT_NODE_REQUEST_TIMEOUT;
    }
};

/**
 * Returns a new HELIX instance if provider is passed, otherwise returns the global instance
 *
 * @method getHelixInstance
 * @param {object} [settings]
 *
 * @returns {object} HELIX instance
 */
const getHelixInstance = (settings, requestTimeout = DEFAULT_NODE_REQUEST_TIMEOUT) => {
    if (settings) {
        // TODO
        const { url, token, password } = settings;

        const instance = composeAPI({
            provider: URL
        })

        // TODO
        // instance.api.setApiTimeout(requestTimeout);

        return instance;
    }

    // iota.api.setApiTimeout(requestTimeout);

    return helix;
};

/**
 * Promisified version of helix getBalances
 *
 * @method getBalances
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array, number): Promise<object>}
 */
const getBalances = (settings, withQuorum = true) => (addresses, threshold = DEFAULT_BALANCES_THRESHOLD) =>
    withQuorum
        ? quorum.getBalances(addresses, threshold)
        : new Promise((resolve, reject) => {
              getHelixInstance(settings, getApiTimeout('getBalances')).api.getBalances(
                  addresses,
                  threshold,
                  (err, balances) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(balances);
                      }
                  },
              );
          });

/**
 * Promisified version of iota.api.getNodeInfo
 *
 * @method getNodeInfoAsync
 * @param {object} [settings]
 *
 * @returns {function(): Promise<object>}
 */
const getNodeInfoAsync = (settings) => () =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings, getApiTimeout('getNodeInfo')).api.getNodeInfo((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });

/**
 * Promisified version of iota.api.getTransactionsObjects
 *
 * @method getTransactionsObjects
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<any>}
 */
const getTransactionsObjects = (settings) => (hashes) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings).api.getTransactionsObjects(hashes, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });

/**
 * Promisified version of iota.api.findTransactionObjects
 *
 * @method findTransactionObjects
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<any>}
 */
const findTransactionObjects = (settings) => (args) =>
    findTransactions(settings)(args).then((hashes) => getTransactionsObjects(settings)(hashes));

/**
 * Promisified version of iota.api.findTransactions
 *
 * @method findTransactions
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<array>}
 */
const findTransactions = (settings) => (args) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings).api.findTransactions(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });

/**
 * Promisified version of iota.api.getLatestInclusion
 *
 * @method getLatestInclusion
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const getLatestInclusion = (settings, withQuorum = false) => (hashes) =>
    withQuorum
        ? quorum.getLatestInclusion(hashes)
        : new Promise((resolve, reject) => {
              getHelixInstance(settings, getApiTimeout('getInclusionStates')).api.getLatestInclusion(
                  hashes,
                  (err, states) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(states);
                      }
                  },
              );
          });

/**
 * Extended version of iota.api.promoteTransaction with an option to perform PoW locally
 *
 * @method promoteTransaction
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, number, number, object): Promise<string>}
 */
const promoteTransaction = (settings, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
    transfer = { address: 'U'.repeat(81), value: 0, message: '', tag: '' },
) => {
    const cached = {
        trytes: [],
    };

    return (
        isPromotable(settings)(hash, { rejectWithReason: true })
            // rejectWithReason only resolves if provided hashes are consistent
            .then(() => prepareTransfersAsync(settings)(transfer.address, [transfer]))
            .then((trytes) => {
                cached.trytes = trytes;

                return getTransactionsToApprove(settings)(
                    {
                        reference: hash,
                        adjustDepth: true,
                    },
                    depth,
                );
            })
            .then(({ trunkTransaction, branchTransaction }) =>
                attachToTangle(settings, seedStore)(
                    trunkTransaction,
                    branchTransaction,
                    cached.trytes,
                    minWeightMagnitude,
                ),
            )
            .then(({ trytes }) => {
                cached.trytes = trytes;

                return storeAndBroadcast(settings)(cached.trytes);
            })
            .then(() => hash)
    );
};

/**
 * Promisified version of iota.api.replayBundle
 *
 * @method replayBundle
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, function, number, number): Promise<array>}
 */
const replayBundle = (settings, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return getBundleAsync(settings)(hash)
        .then((bundle) => {
            const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);
            cached.trytes = map(bundle, convertToTrytes);
            cached.transactionObjects = bundle;

            return getTransactionsToApprove(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangle(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcast(settings)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getBundle
 *
 * @method getBundleAsync
 * @param {object} [settings]
 *
 * @returns {function(string): Promise<array>}
 */
const getBundleAsync = (settings) => (tailTransactionHash) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings).api.getBundle(tailTransactionHash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                resolve(bundle);
            }
        });
    });

/**
 * Promisified version of iota.api.wereAddressesSpentFrom
 *
 * @method wereAddressesSpentFrom
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const wereAddressesSpentFrom = (settings, withQuorum = true) => (addresses) =>
    withQuorum
        ? quorum.wereAddressesSpentFrom(addresses)
        : new Promise((resolve, reject) => {
              getHelixInstance(settings, getApiTimeout('wereAddressesSpentFrom')).api.wereAddressesSpentFrom(
                  addresses,
                  (err, wereSpent) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(wereSpent);
                      }
                  },
              );
          });

/**
 * Promisified version of iota.api.sendTransfer
 *
 * @method sendTransfer
 * @param {object} [settings]
 *
 * @returns {function(object, array, function, *, number, number): Promise<array>}
 */
const sendTransfer = (settings) => (
    seedStore,
    transfers,
    options = null,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return seedStore
        .prepareTransfers(settings)(transfers, options)
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApprove(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangle(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcast(settings)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getTransactionsToApprove
 *
 * @method getTransactionsToApprove
 * @param {object} [settings]
 *
 * @returns {function(*, number): Promise<object>}
 */
const getTransactionsToApprove = (settings) => (reference = {}, depth = DEFAULT_DEPTH) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings, getApiTimeout('getTransactionsToApprove')).api.getTransactionsToApprove(
            depth,
            reference,
            (err, transactionsToApprove) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(transactionsToApprove);
                }
            },
        );
    });

/**
 * Promisified version of iota.api.prepareTransfers
 *
 * @method prepareTransfersAsync
 * @param {object} [settings]
 *
 * @returns {function(string, array, *): Promise<any>}
 */
export const prepareTransfersAsync = (settings) => (seed, transfers, options = null, signatureFn = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, transfers];

    if (options) {
        args = [...args, { ...options, nativeGenerateSignatureFunction: signatureFn }];
    }

    const api = composeAPI(settings || { ...iota });

    return api.prepareTransfers(...args);
};

/**
 * Promisified version of iota.api.storeAndBroadcast
 *
 * @method storeAndBroadcast
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<any>}
 */
const storeAndBroadcast = (settings) => (trytes) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings).api.storeAndBroadcast(trytes, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

/**
 * Checks if attachToTangle is available on the provided node
 *
 * @method checkAttachToTangleAsync
 * @param {string} node
 *
 * @returns {Promise}
 */
const checkAttachToTangleAsync = (node) => {
    return fetch(node, {
        method: 'POST',
        body: JSON.stringify({ command: 'attachToTangle' }),
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-IOTA-API-Version': IRI_API_VERSION,
        }),
    })
        .then((res) => res.json())
        .catch(() => {
            // return a fake normal IRI response when attachToTangle is not available
            return { error: Errors.ATTACH_TO_TANGLE_UNAVAILABLE };
        });
};

/**
 * Checks if remote pow is allowed on the provided node
 *
 * @method allowsRemotePow
 * @param {object} settings
 *
 * @returns {Promise<Boolean>}
 */
const allowsRemotePow = (settings) => {
    return getNodeInfoAsync(settings)().then((info) => {
        // Check if provided node has upgraded to IRI to a version, where it adds "features" prop in node info
        if (has(info, 'features')) {
            return includes(info.features, 'RemotePOW');
        }

        // Fallback to old way of checking remote pow
        return checkAttachToTangleAsync(settings.url).then((response) =>
            includes(response.error, Errors.INVALID_PARAMETERS),
        );
    });
};

/**
 * Promisified version of iota.api.attachToTangle
 *
 * @method attachToTangle
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, string, array, number): Promise<object>}
 */
const attachToTangle = (settings, seedStore) => (
    trunkTransaction,
    branchTransaction,
    trytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = get(seedStore, 'offloadPow') === true;

    if (shouldOffloadPow) {
        const request = (requestTimeout) =>
            new Promise((resolve, reject) => {
                getHelixInstance(settings, requestTimeout).api.attachToTangle(
                    trunkTransaction,
                    branchTransaction,
                    minWeightMagnitude,
                    // Make sure trytes are sorted properly
                    sortTransactionTrytesArray(trytes),
                    (err, attachedTrytes) => {
                        if (err) {
                            reject(err);
                        } else {
                            constructBundleFromAttachedTrytes(attachedTrytes, seedStore)
                                .then((transactionObjects) => {
                                    if (
                                        isBundle(transactionObjects) &&
                                        isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
                                    ) {
                                        resolve({
                                            transactionObjects,
                                            trytes: attachedTrytes,
                                        });
                                    } else {
                                        reject(new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_REMOTE_POW));
                                    }
                                })
                                .catch(reject);
                        }
                    },
                );
            });

        const defaultRequestTimeout = getApiTimeout('attachToTangle');

        return withRequestTimeoutsHandler(defaultRequestTimeout)(request);
    }

    return seedStore
        .performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude)
        .then((result) => {
            if (get(result, 'trytes') && get(result, 'transactionObjects')) {
                return Promise.resolve(result);
            }

            // Batched proof-of-work only returns the attached trytes
            return constructBundleFromAttachedTrytes(sortTransactionTrytesArray(result), seedStore).then(
                (transactionObjects) => ({
                    transactionObjects: orderBy(transactionObjects, 'currentIndex', ['desc']),
                    trytes: result,
                }),
            );
        })
        .then(({ transactionObjects, trytes }) => {
            if (
                isBundle(transactionObjects) &&
                isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
            ) {
                return {
                    transactionObjects,
                    trytes,
                };
            }

            throw new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_LOCAL_POW);
        });
};

/**
 * Promisified version of iota.api.getTrytes
 *
 * @method getTrytesAsync
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<array>}
 */
const getTrytesAsync = (settings) => (hashes) =>
    new Promise((resolve, reject) => {
        getHelixInstance(settings).api.getTrytes(hashes, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve(trytes);
            }
        });
    });

/**
 * Checks if a node is synced and runs a stable IRI release
 *
 * @method isNodeHealthy
 * @param {object} [settings]
 *
 * @returns {Promise}
 */
const isNodeHealthy = (settings) => {
    const cached = {
        latestMilestone: EMPTY_HASH_BYTES,
    };

    return getNodeInfoAsync(settings)()
        .then(
            ({
                appVersion,
                latestMilestone,
                latestMilestoneIndex,
                latestSolidSubtangleMilestone,
                latestSolidSubtangleMilestoneIndex,
            }) => {
                if (['rc', 'beta', 'alpha'].some((el) => appVersion.toLowerCase().indexOf(el) > -1)) {
                    throw new Error(Errors.UNSUPPORTED_NODE);
                }
                cached.latestMilestone = latestMilestone;
                if (
                    (cached.latestMilestone === latestSolidSubtangleMilestone ||
                        latestMilestoneIndex - MAX_MILESTONE_FALLBEHIND <= latestSolidSubtangleMilestoneIndex) &&
                    cached.latestMilestone !== EMPTY_HASH_BYTES
                ) {
                    return getTrytesAsync(settings)([cached.latestMilestone]);
                }

                throw new Error(Errors.NODE_NOT_SYNCED);
            },
        )
        .then((trytes) => {
            const { timestamp } = iota.utils.transactionObject(head(trytes), cached.latestMilestone);

            return isWithinMinutes(timestamp * 1000, 5 * MAX_MILESTONE_FALLBEHIND);
        });
};

/**
 * Extended version of iota.api.isPromotable.
 *
 * @method isPromotable
 * @param {object} [settings]
 *
 * @returns {function(string): (Promise<boolean>)}
 */
const isPromotable = (settings) => (tailTransactionHash, options = {}) =>
    getHelixInstance(settings).api.isPromotable(tailTransactionHash, options);

export {
    getHelixInstance,
    getApiTimeout,
    getBalances,
    getNodeInfoAsync,
    getTransactionsObjects,
    findTransactionObjects,
    findTransactions,
    getLatestInclusion,
    promoteTransaction,
    replayBundle,
    getBundleAsync,
    wereAddressesSpentFrom,
    sendTransfer,
    getTransactionsToApprove,
    storeAndBroadcast,
    attachToTangle,
    checkAttachToTangleAsync,
    allowsRemotePow,
    isNodeHealthy,
    isPromotable,
};

import get from 'lodash/get';
import head from 'lodash/head';
import has from 'lodash/has';
import includes from 'lodash/includes';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty'
import { composeAPI } from '@helixnetwork/core';
import { asTransactionHBytes , asTransactionObject,asTransactionObjects } from "@helixnetwork/transaction-converter";
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
    sortTransactionBytesArray,
    constructBundleFromAttachedBytes,
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

const getApiTimeout = (method) => {

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
    let  url, token, password ;
    if (settings) {
        // TODO
        
        if(settings.url === undefined)
        {
             url = settings;
        }
        else{
            // const { url, token, password } = settings;
            url = settings.url;
            token = settings.token;
            password = settings.password;
        }
        

        const instance = composeAPI({
            provider: url
        })

        // TODO
        // instance.api.setApiTimeout(requestTimeout);

        return instance;
    }

    // iota.api.setApiTimeout(requestTimeout);

    return helix;
};

/**
 * Helix getBalances
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
        : getHelixInstance(settings, getApiTimeout('getBalances')).getBalances(addresses, threshold);

/**
 * helix getNodeInfoApi
 *
 * @method getNodeInfo
 * @param {object} [settings]
 *
 * @returns {function(): Promise<object>}
 */
const getNodeInfo = (settings) => () =>
        getHelixInstance(settings, getApiTimeout('getNodeInfo')).getNodeInfo();


/**
 * Helix getTransactionsObjects
 *
 * @method getTransactionsObjects
 *
 * @returns {function(array): Promise<any>}
 */
const getTransactionsObjects = (settings) => (hashes) =>
      getHelixInstance(settings).getTransactionObjects(hashes);

// TODO : Check if fintransaction objects to be used the new dedicated helix method
/**
 * Helix findTransactionObjects
 *
 * @method findTransactionObjects
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<any>}
 */
const findTransactionObjects = (settings) => (args) =>
    findTransactions(settings)(args).then((hashes) => 
         getTransactionsObjects(settings)(hashes));

/**
 * Helix findTransactions
 *
 * @method findTransactions
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<array>}
 */
const findTransactions = (settings) => (args) =>
        getHelixInstance(settings).findTransactions(args);


/**
 * Helix getLatestInclusion
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
        : getHelixInstance(settings, getApiTimeout('getInclusionStates')).getLatestInclusion(hashes);


/**
 * Helix promoteTransaction with an option to perform PoW locally
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
    transfer = { address: '0'.repeat(64), value: 0, message: '', tag: '' },
) => {
    const cached = {
        bytes: [],
    };

    return (
        isPromotable(settings)(hash)
            .then(() => prepareTransfers(settings)(transfer.address, [transfer]))
            .then((bytes) => {
                cached.bytes = bytes;

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
                    cached.bytes,
                    minWeightMagnitude,
                ),
            )
            .then(({ bytes }) => {
                cached.bytes = bytes;
                return storeAndBroadcast(settings)(cached.bytes);
            })
            .then(() => hash)
    );
};

/**
 * Helix ReplayBundle
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
        bytes: [],
        transactionObjects: [],
    };

    return getBundle(settings)(hash)
        .then((bundle) => {
            const convertToBytes = (tx) => asTransactionHBytes(tx);
            cached.bytes = map(bundle, convertToBytes);
            cached.transactionObjects = bundle;

            return getTransactionsToApprove(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangle(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.bytes,
                minWeightMagnitude,
            ),
        )
        .then(({ hbytes, transactionObjects }) => {
            cached.bytes = hbytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcast(settings)(cached.bytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Helix getBundle
 *
 * @method getBundle
 * @param {object} [settings]
 *
 * @returns {function(string): Promise<array>}
 */
const getBundle = (settings) => (tailTransactionHash) =>
        getHelixInstance(settings).getBundle(tailTransactionHash);

/**
 * Helix wereAddressesSpentFrom
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
        :    getHelixInstance(settings, getApiTimeout('wereAddressesSpentFrom')).wereAddressesSpentFrom(addresses);

/**
 * Helix sendTransfer
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
        bytes: [],
        transactionObjects: [],
    };

    return seedStore
        .prepareTransfers(settings)(transfers, options)
        .then((bytes) => {
            cached.bytes = bytes;

            return getTransactionsToApprove(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>

            attachToTangle(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.bytes,
                minWeightMagnitude,
            ),
        )
        .then(({ hbytes, transactionObjects }) => {
            cached.bytes = hbytes;
            cached.transactionObjects = transactionObjects;
            return storeAndBroadcast(settings)(cached.bytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Helix getTransactionsToApprove
 *
 * @method getTransactionsToApprove
 * @param {object} [settings]
 *
 * @returns {function(*, number): Promise<object>}
 */
const getTransactionsToApprove = (settings) => (reference = {}, depth = DEFAULT_DEPTH) =>{
    if(isEmpty(reference))
        return getHelixInstance(settings, getApiTimeout('getTransactionsToApprove')).getTransactionsToApprove(
            depth);    
    else
        return getHelixInstance(settings, getApiTimeout('getTransactionsToApprove')).getTransactionsToApprove(
                depth,
                reference);
        
    }

/**
 * Helix prepareTransfers
 *
 * @method prepareTransfers
 * @param {object} [settings]
 *
 * @returns {function(string, array, *): Promise<any>}
 */
export const prepareTransfers = (settings) => (seed, transfers, options = null, signatureFn = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, transfers];

    if (options) {
        args = [...args, { ...options, nativeGenerateSignatureFunction: signatureFn }];
    }

   return getHelixInstance(settings).prepareTransfers(...args);
};

/**
 * Helix storeAndBroadcast
 *
 * @method storeAndBroadcast
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<any>}
 */
const storeAndBroadcast = (settings) => (bytes) =>{
        getHelixInstance(settings).storeAndBroadcast(bytes);
}


/**
 * Checks if attachToTangle is available on the provided node
 *
 * @method checkAttachToTangle
 * @param {string} node
 *
 * @returns {Promise}
 */
const checkAttachToTangle = (node) => {
    return fetch(node, {
        method: 'POST',
        body: JSON.stringify({ command: 'attachToTangle' }),
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-HELIX-API-Version': IRI_API_VERSION,
        }),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        }

        throw response;
    })
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

    return getNodeInfo(settings)().then((info) => {
        // Check if provided node has upgraded to IRI to a version, where it adds "features" prop in node info
        if (has(info, 'features')) {
            return includes(info.features, 'RemotePOW');
        }
        // Fallback to old way of checking remote pow
        return checkAttachToTangle(settings.url).then((response) =>
            includes(response.error, Errors.INVALID_PARAMETERS),
        );
    });
};

/**
 * Helix attachToTangle
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
    bytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = get(seedStore, 'offloadPow') === true;
    if (shouldOffloadPow) {
        const request = (requestTimeout) =>
                getHelixInstance(settings, requestTimeout).attachToTangle(
                    trunkTransaction,
                    branchTransaction,
                    minWeightMagnitude,
                    // Make sure bytes are sorted properly
                    sortTransactionBytesArray(bytes)).then(
                    (err, attachedBytes) => {
                        if (err) {
                            reject(err);
                        } else {
                            constructBundleFromAttachedBytes(attachedBytes, seedStore)
                                .then((transactionObjects) => {
                                    if (
                                        isBundle(transactionObjects) &&
                                        isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
                                    ) {
                                        resolve({
                                            transactionObjects,
                                            bytes: attachedBytes,
                                        });
                                    } else {
                                        reject(new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_REMOTE_POW));
                                    }
                                })
                                .catch(reject);
                        }
                    });
                

        const defaultRequestTimeout = getApiTimeout('attachToTangle');

        return withRequestTimeoutsHandler(defaultRequestTimeout)(request);
    }
    return seedStore
        .performPow(bytes, trunkTransaction, branchTransaction, minWeightMagnitude)
        .then((result) => {
            if (get(result, 'hbytes') && get(result, 'transactionObjects')) {
                return Promise.resolve(result);
            }
            // Batched proof-of-work only returns the attached bytes
            return constructBundleFromAttachedBytes(sortTransactionBytesArray(result), seedStore).then(
                (transactionObjects) => ({
                    transactionObjects: orderBy(transactionObjects, 'currentIndex', ['desc']),
                    bytes: result,
                }),
            );
        })
        .then(({ transactionObjects, hbytes }) => {
            if (
                isBundle(transactionObjects) &&
                isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
            ) {
                return {
                    transactionObjects,
                    hbytes,
                };
            }

            throw new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_LOCAL_POW);
        });
};

/**
 * Helix getBytes
 *
 * @method getBytes
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<array>}
 */
const getBytes = (settings) => (hashes) =>
        getHelixInstance(settings).getBytes(hashes);

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

    return getNodeInfo(settings)()
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
                    return getBytes(settings)([cached.latestMilestone]);
                }

                throw new Error(Errors.NODE_NOT_SYNCED);
            },
        )
        .then((bytes) => {
            // TODO
            const { timestamp } = asTransactionObject(head(bytes), cached.latestMilestone);

            return isWithinMinutes(timestamp * 1000, 5 * MAX_MILESTONE_FALLBEHIND);
        });
};

/**
 * Helix isPromotable.
 *
 * @method isPromotable
 * @param {object} [settings]
 *
 * @returns {function(string): (Promise<boolean>)}
 */
const isPromotable = (settings) => (tailTransactionHash) =>
    getHelixInstance(settings).isPromotable(tailTransactionHash);

export {
    getHelixInstance,
    getApiTimeout,
    getBalances,
    getNodeInfo,
    getTransactionsObjects,
    findTransactionObjects,
    findTransactions,
    getLatestInclusion,
    promoteTransaction,
    replayBundle,
    getBundle,
    wereAddressesSpentFrom,
    sendTransfer,
    getTransactionsToApprove,
    storeAndBroadcast,
    attachToTangle,
    checkAttachToTangle,
    allowsRemotePow,
    isNodeHealthy,
    isPromotable,
};

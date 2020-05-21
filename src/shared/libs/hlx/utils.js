import get from 'lodash/get';
import filter from 'lodash/filter';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import includes from 'lodash/includes';
import isNull from 'lodash/isNull';
import sampleSize from 'lodash/sampleSize';
import size from 'lodash/size';
import cloneDeep from 'lodash/cloneDeep';
import URL from 'url-parse';
import { BigNumber } from 'bignumber.js';
import { txsToAscii, asciiToTxHex } from '@helixnetwork/converter';
import { addChecksum, isValidChecksum } from '@helixnetwork/checksum';
import { isNodeHealthy } from './extendedApi';
import { NODELIST_URL, MAX_REQUEST_TIMEOUT } from '../../config';
import Errors from '../errors';
import { bitsToChars, hexToBits } from './converter';
import { roundDown } from '../utils';

export const MAX_SEED_LENGTH = 64; // should be 64

export const MAX_SEED_BITS = MAX_SEED_LENGTH * 4;

export const SEED_CHECKSUM_LENGTH = 8;

export const ADDRESS_LENGTH_WITHOUT_CHECKSUM = MAX_SEED_LENGTH;

export const ADDRESS_LENGTH = 72;

export const CHECKSUM_LENGTH = ADDRESS_LENGTH - ADDRESS_LENGTH_WITHOUT_CHECKSUM;

export const VALID_SEED_REGEX = /^[a-f0-9]+$/;

export const VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX = VALID_SEED_REGEX;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[a-f0-9]{72}$/;

export const TOTAL_HELIX_SUPPLY = 2779530283277761;

export const HASH_SIZE = 64;

export const TRANSACTION_BYTES_SIZE = 1536;

export const EMPTY_HASH_TXBYTES = '0'.repeat(HASH_SIZE);

export const EMPTY_TRANSACTION_HEX = '0'.repeat(TRANSACTION_BYTES_SIZE);

export const EMPTY_TRANSACTION_MESSAGE = 'Empty';

export const HELIX_DENOMINATIONS = ['h', 'Kh', 'Mh', 'Gh', 'Th'];

/**
 * Converts TxBytes to ascii
 *
 * @method convertFromBytes
 * @param {string} TxBytes
 *
 * @returns {string}
 */
export const convertFromBytes = (txBytes) => {
    const bytesWithoutZero = txBytes.replace(/00+$/, '');
    let message;
    try {
        message = txsToAscii(bytesWithoutZero);
    } catch (err) {
        // Fall back to safe result in case of inconsistent conversion strings
        message = null;
    }
    /* eslint-disable no-control-regex */
    if (bytesWithoutZero && message && /^[\x00-\x7F]*$/.test(message)) {
        return message;
    }
    /* eslint-enable no-control-regex */
    return EMPTY_TRANSACTION_MESSAGE;
};

/**
 * Gets checksum.
 *
 * @method getChecksum
 *
 * @param {string | array} input - seed txBytes | seed txBits
 * @param {number} [length]
 *
 * @returns {string | array}
 */
export const getChecksum = async (
    input,
    // TxBytes  to txBits conversion creates Int8Array
    length = input instanceof Int8Array ? SEED_CHECKSUM_LENGTH * 8 : SEED_CHECKSUM_LENGTH,
) => {
    const isInputArray = input instanceof Int8Array;
    const finalInput = isInputArray ? bitsToChars(Array.from(input)) : input;
    const finalLength = isInputArray ? length / 8 : length;

    const result = await addChecksum(finalInput, finalLength, false).slice(-finalLength);
    const finalResult = isInputArray ? hexToBits(result) : result;
    return finalResult;
};

/**
 * Checks if a seed is valid
 *
 * @method isValidSeed
 * @param {string} seed
 *
 * @returns {boolean}
 */
export const isValidSeed = (seed) => seed.length === MAX_SEED_LENGTH && seed.match(VALID_SEED_REGEX);

/**
 * Formats Helix value
 *
 * @method formatValue
 * @param {number} value
 *
 * @returns {number}
 */
export const formatValue = (value) => {
    let negative = false;
    if (value < 0) {
        negative = true;
        value = -value;
    }
    switch (true) {
        case value < 1000:
            break;
        case value < 1000000:
            value /= 1000;
            break;
        case value < 1000000000:
            value /= 1000000;
            break;
        case value < 1000000000000:
            value /= 1000000000;
            break;
        default:
            value /= 1000000000000;
            break;
    }

    if (negative === true) {
        return -value;
    }

    return value;
};

/**
 * Gets relevant denomination for provided Helix value
 *
 * @method formatUnit
 * @param {number} value
 *
 * @returns {string}
 */
export const formatUnit = (value) => {
    if (value < 0) {
        value = -value;
    }

    switch (true) {
        case value < 1000:
            return 'HLX';
        case value < 1000000:
            return 'kHLX';
        case value < 1000000000:
            return 'mHLX';
        case value < 1000000000000:
            return 'gHLX';
        default:
            return 'tHLX';
    }
};

/**
 * Converts helix value-unit string to int value
 *
 * @method unitStringToValue
 * @param {string}
 *
 * @returns {number}
 */
export const unitStringToValue = (str) => {
    const value = parseInt(str);
    const unit = str.substr(value.toString().length).toLowerCase();

    switch (unit) {
        case 'kh':
            return value * 1000;
        case 'mh':
            return value * 1000000;
        case 'gh':
            return value * 1000000000;
        case 'th':
            return value * 1000000000000;
        case 'ph':
            return value * 1000000000000000;
        default:
            return value;
    }
};

/**
 * Format hlx to human readable format
 * @param {number} hlx - Input value in hlx
 * @param {boolean} showShort - Should output short format
 * @param {boolean} showUnit - Should output unit
 *
 * @returns {string}
 */
export const formatHlx = (hlx, showShort, showUnit) => {
    const formattedValue = formatValue(hlx);
    const outputValue = !showShort
        ? formattedValue
        : roundDown(formattedValue, 1) + (hlx < 1000 || (hlx / formattedValue) % 10 === 0 ? '' : '+');

    return `${outputValue}${showUnit ? ' ' + formatUnit(hlx) : ''}`;
};

/**
 * Checks if provided server address is valid
 *
 * @method isValidServerAddress
 * @param {string} server
 *
 * @returns {boolean}
 */
export const isValidServerAddress = (server) => {
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
        return false;
    }

    return true;
};

/**
 * Checks if provided Helix address is valid
 *
 * @method isValidAddress
 * @param {string} address
 *
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
    if (!isNull(address.match(VALID_SEED_REGEX))) {
        return size(address) === 72 && isValidChecksum(address);
    }

    return false;
};

/**
 * Checks if provided Helix message is valid
 *
 * @method isValidMessage
 * @param {string} message
 *
 * @returns {boolean}
 */
export const isValidMessage = (message) => {
    try {
        return txsToAscii(asciiToTxHex(message)) === message;
    } catch (err) {
        // return false as it was invalid message
        return false;
    }
};

/**
 * Checks if provided amount is valid
 *
 * @method isValidAmount
 * @param {string|number} amount
 * @param {number} multiplier
 * @param {boolean} isFiat
 *
 * @returns {boolean}
 */
export const isValidAmount = (amount, multiplier, isFiat = false) => {
    const value = new BigNumber(parseFloat(amount)).times(new BigNumber(multiplier)).toNumber();
    // For sending a message
    if (amount === '') {
        return true;
    }

    // Ensure helix value is an integer
    if (!isFiat) {
        if (value % 1 !== 0) {
            return false;
        }
    }

    if (value < 0) {
        return false;
    }

    return !isNaN(amount);
};

/**
 * @typedef {Object} ParsedURL
 * @property {string} address The parsed address
 * @property {string} message The parsed message
 * @property {number} amount The parsed amount
 */

/** Parse an Helix address input
 * @param {string} input
 * @returns {ParsedURL} - The parsed address, message and/or amount values
 */
export const parseAddress = (input) => {
    const result = {
        address: null,
        message: null,
        amount: null,
    };

    if (!input || typeof input !== 'string') {
        return null;
    }

    if (input.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
        result.address = input;
        return result;
    }

    try {
        let parsed = {
            address: null,
            message: null,
            amount: null,
        };

        if (input.toLowerCase().indexOf('helix:') === 0) {
            const url = new URL(input, true);
            parsed.address = url.hostname.toUpperCase();
            parsed.message = url.query.message;
            parsed.amount = url.query.amount;
        } else {
            parsed = JSON.parse(input);
        }

        if (parsed.address.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            result.address = parsed.address;
        } else {
            return null;
        }
        if (parsed.message && typeof parsed.message === 'string') {
            result.message = parsed.message;
        }
        if (parsed.amount && String(parsed.amount) === String(parseInt(parsed.amount, 10))) {
            result.amount = Math.abs(parseInt(parsed.amount, 10));
        }
    } catch (error) {
        return null;
    }

    return result;
};

/**
 * Retry Helix api calls on different nodes
 *
 * @method withRetriesOnDifferentNodes
 *
 * @param {array} nodes
 * @param {array|function} [failureCallbacks]
 *
 * @returns {function(function): function(...[*]): Promise}
 */
export const withRetriesOnDifferentNodes = (nodes, failureCallbacks) => {
    let attempt = 0;
    let executedCallback = false;
    const retries = size(nodes);
    return (promiseFunc) => {
        const execute = (...args) => {
            if (isUndefined(nodes[attempt])) {
                return Promise.reject(new Error(Errors.NO_NODE_TO_RETRY));
            }

            return promiseFunc(nodes[attempt])(...args)
                .then((result) => ({ node: nodes[attempt], result }))
                .catch((err) => {
                    if (get(err, 'message') === Errors.LEDGER_INVALID_INDEX) {
                        throw new Error(Errors.LEDGER_INVALID_INDEX);
                    }
                    // Abort retries on user cancelled Ledger action
                    if (get(err, 'message') === Errors.LEDGER_CANCELLED) {
                        throw new Error(Errors.LEDGER_CANCELLED);
                    }
                    // If a function is passed as failure callback
                    // Just trigger it once.
                    if (isFunction(failureCallbacks)) {
                        if (!executedCallback) {
                            executedCallback = true;
                            failureCallbacks();
                        }
                        // If an array of functions is passed
                        // Execute callback on each failure
                    } else if (isArray(failureCallbacks)) {
                        if (isFunction(failureCallbacks[attempt])) {
                            failureCallbacks[attempt]();
                        }
                    }

                    attempt += 1;

                    if (attempt < retries) {
                        return execute(...args);
                    }

                    throw err;
                });
        };

        return execute;
    };
};

/**
 * Fetches list of Helix nodes from a server
 *
 * @method fetchRemoteNodes
 * @param {string} [url]
 * @param {object} [options]
 *
 * @returns {Promise<*>}
 */
export const fetchRemoteNodes = (
    url = NODELIST_URL,
    options = {
        headers: {
            Accept: 'application/json',
        },
    },
) =>
    fetch(url, options)
        .then((response) => response.json())
        .then((response) => {
            if (isArray(response)) {
                return response.filter((node) => typeof node.node === 'string' && node.node.indexOf('https://') === 0);
            }

            return [];
        });

/**
 * Gets random nodes.
 *
 * @method getRandomNodes
 * @param {array} nodes
 * @param {number} [size]
 * @param {array} [blacklistedNodes]
 * @param {bool} Remote PoW
 *
 * @returns {Array}
 */
export const getRandomNodes = (nodes, size = 5, blacklistedNodes = [], PoW = false) => {
    let nodesToSample = cloneDeep(nodes);
    if (PoW) {
        nodesToSample = filter(nodes, (node) => node.pow === true);
    }
    return sampleSize(filter(nodesToSample, (node) => !find(blacklistedNodes, { url: node.url })), size);
};

/**
 * Throws an error if a node is not synced.
 *
 * @method throwIfNodeNotHealthy
 * @param {object} settings
 *
 * @returns {Promise<boolean>}
 */
export const throwIfNodeNotHealthy = (settings) => {
    return isNodeHealthy(settings).then((isSynced) => {
        if (!isSynced) {
            throw new Error(Errors.NODE_NOT_SYNCED_BY_TIMESTAMP);
        }

        return isSynced;
    });
};

/**
 * Handles timeouts for network requests made to IRI nodes
 * Catches "request timeout" exceptions and retries network request with increased timeout
 *
 * @method withRequestTimeoutsHandler
 *
 * @param {number} timeout
 *
 * @returns {function}
 */
export const withRequestTimeoutsHandler = (timeout) => {
    let attempt = 1;

    const getNextTimeout = () => attempt * timeout;

    const handleTimeout = (promiseFunc) => {
        return promiseFunc(getNextTimeout()).catch((error) => {
            attempt += 1;

            if (
                (includes(error.message, Errors.REQUEST_TIMED_OUT) ||
                    includes(error.message, Errors.REQUEST_TIMED_OUT.toLowerCase())) &&
                getNextTimeout() < MAX_REQUEST_TIMEOUT
            ) {
                return handleTimeout(promiseFunc);
            }

            throw error;
        });
    };

    return handleTimeout;
};

/**
 *   Removes the 8-TxBytes checksum of an address
 *
 *   @method noChecksum
 *   @param {string | list} address
 *   @returns {string | list} address (without checksum)
 **/
export const noChecksum = function(address) {
    const isSingleAddress = typeof address === 'string';

    if (isSingleAddress && address.length === 64) {
        return address;
    }

    // If only single address, turn it into an array
    if (isSingleAddress) {
        address = new Array(address);
    }

    // eslint-disable-next-line prefer-const
    let addressesWithChecksum = [];

    address.forEach((thisAddress) => {
        addressesWithChecksum.push(thisAddress.slice(0, 64));
    });

    // return either string or the list
    if (isSingleAddress) {
        return addressesWithChecksum[0];
    }
    return addressesWithChecksum;
};

/**
 * Set base value for hlx based on selected unit
 *
 * @method setBase
 * @param {string} [selectedHlx]
 * @param {number} [value]
 *
 * @returns {number}
 */

export const setBase = (selectedHlx) => {
    let base = 0;
    if (selectedHlx === 'HLX') {
        base = 1;
    } else if (selectedHlx === 'kHLX') {
        base = 1000;
    } else if (selectedHlx === 'mHLX') {
        base = 1000000;
    } else if (selectedHlx === 'gHLX') {
        base = 1000000000;
    } else if (selectedHlx === 'tHLX') {
        base = 1000000000000;
    }
    return base;
};

/**
 * Converts hlx from one unit to selected unit
 *
 * @method unitConverter
 * @param {string} [balance]
 * @param {string} [selectedUnit]
 *
 * @returns {string}
 */

export const unitConverter = (balance, selectedUnit) => {
    let convertedValue = 0;
    switch (selectedUnit) {
        case 'HLX':
            convertedValue = balance;
            break;
        case 'kHLX':
            convertedValue = balance / 1000;
            break;
        case 'mHLX':
            convertedValue = balance / 1000000;
            break;
        case 'gHLX':
            convertedValue = balance / 1000000000;
            break;
        case 'tHLX':
            convertedValue = balance / 1000000000000;
            break;
        default:
            convertedValue = balance;
            break;
    }
    return convertedValue;
};

/**
 * Capitalizes a string
 * @param {string} input - The target string
 * @param {string} Capitalized string
 */
const capitalize = (input) => {
    return typeof input === 'string' && input.length > 0 ? input[0].toUpperCase() + input.substr(1).toLowerCase() : '';
};

/**
 * Trim a string to certain size
 * @param {string} input - The target string
 * @param {number} length - The target length
 * @param {string} Trimmed string
 */
const shorten = (input, length) => {
    return typeof input === 'string' && input.length > length ? input.substr(0, length - 1) + '…' : input;
};

/**
 * HexaDecimal txBit mapping
 */

const hexBits = [
   [0,1,1,0,0,0,0,1], // a
   [0,1,1,0,0,0,1,0], // b
   [0,1,1,0,0,0,1,1], // c
   [0,1,1,0,0,1,0,0], // d
   [0,1,1,0,0,1,0,1], // e
   [0,1,1,0,0,1,1,0], // f
   [0,0,1,1,0,0,0,0], // 0
   [0,0,1,1,0,0,0,1], // 1
   [0,0,1,1,0,0,1,0], // 2
   [0,0,1,1,0,0,1,1], // 3
   [0,0,1,1,0,1,0,0], // 4
   [0,0,1,1,0,1,0,1], // 5
   [0,0,1,1,0,1,1,0], // 6
   [0,0,1,1,0,1,1,1], // 7
   [0,0,1,1,1,0,0,0], // 8
   [0,0,1,1,1,0,0,1], // 9
];

const bitStrings = hexBits.map((txBit) => txBit.toString());

/**
 * Convert index of hexBits  to an ASCII character
 * @param {txBit} txBit - raw Bit input
 */
const indexToChar = (txBit) => {
    return 'abcdef0123456789'.charAt(txBit % 16);
};

/**
 * Convert single character hex to index
 * @param {string} char - Input character
 * @returns {array} Output txBit array
 */
const charToIndex = (char) => {
    return 'abcdef0123456789'.indexOf(char.toLowerCase());
};

/**
 * Convert single index of hexBit to txBit array
 * @param {number} txByte - Input txByte
 * @returns {array} Output txBit array
 */
const indexToBit = (txByte) => {
    return hexBits[txByte % 16];
};

/**
 * Convert index of hexBits array to txBit array
 * @param {array} txBytes - Input txByte array
 * @returns {array} Output txBit array
 */
const indexesToBits = (txBytes) => {
    let txBits = [];
    for (let i = 0; i < txBytes.length; i++) {
        txBits = txBits.concat(indexToBit(txBytes[i]));
    }
    return txBits;
};

/**
 * Converts hex string to txBits
 *
 * @method hexToBits
 * @param {String} input - hex string to be converted.
 *
 * @return {Int8Array} txBits
 */
const hexToBits = (input) => {
    const result = new Int8Array(input.length * 8);
    for (let i = 0; i < input.length; i++) {
        const index = 'abcdef0123456789'.indexOf(input.charAt(i));
        for ( let j=0;j<8;j++){
            result[i * 8 + j] = hexBits[index][j];
        }
    }
    return result;
};

/**
 * Convert txBit array to string
 * @param {array} txBits - Input txBit array
 * @returns {string} Output string
 */
const bitsToChars = (txBits) => {
    if (!txBits || !txBits.length) {
        return null;
    }
    let chars = '';
    for (let i = 0; i < txBits.length; i += 8) {
        const txBit = txBits.slice(i, i + 8).toString();
        for (let x = 0; x < bitStrings.length; x++) {
            if  (bitStrings[x] === txBit) {
                chars += 'abcdef0123456789'.charAt(x);
            }
        }
    }
    return chars;
};

module.exports = { capitalize, shorten, indexToChar, indexToBit, hexToBits, bitsToChars, charToIndex, indexesToBits };

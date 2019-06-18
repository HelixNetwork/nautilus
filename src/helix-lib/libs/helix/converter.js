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
 * Byte bit mapping
 */

const bytesBits = [
   [0,1,1,0,0,0,0,1], // a
   [0,1,1,0,0,0,1,0], // b
   [0,1,1,0,0,0,1,1], // c
   [0,1,1,0,0,1,0,0], // d
   [0,1,1,0,0,1,0,1], // e
   [0,1,1,0,0,1,1,0]  // f
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

const bitStrings = bytesBits.map((bit) => bit.toString());

/**
 * Convert bit to an ASCII character
 * @param {bit} bit - raw Trit input
 */
const byteToChar = (bit) => {
    return 'abcdef0123456789'.charAt(bit % 16);
};

/**
 * Convert single character string to bit array
 * @param {string} char - Input character
 * @returns {array} Output bit array
 */
const charToByte = (char) => {
    return 'abcdef0123456789'.indexOf(char.toLowerCase());
};

/**
 * Convert single byte to bit array
 * @param {number} byte - Input byte
 * @returns {array} Output bit array
 */
const byteToBit = (byte) => {
    return bytesBits[byte % 16];
};

/**
 * Convert byte array to bit array
 * @param {array} bytes - Input byte array
 * @returns {array} Output bit array
 */
const bytesToBits = (bytes) => {
    let bits = [];
    for (let i = 0; i < bytes.length; i++) {
        bits = bits.concat(byteToBit(bytes[i]));
    }
    return bits;
};

/**
 * Converts byte string to bits
 *
 * @method bytesTo
 * @param {String} input - Tryte string to be converted.
 *
 * @return {Int8Array} bits
 */
const bytesTo = (input) => {
    const result = new Int8Array(input.length * 8);
    for (let i = 0; i < input.length; i++) {
        const index = 'abcdef0123456789'.indexOf(input.charAt(i));
        for ( let j=0;j<8;j++){
            result[i * 8 + j] = bytesBits[index][j];
        }
    }
    return result;
};

/**
 * Convert bit array to string
 * @param {array} bits - Input bit array
 * @returns {string} Output string
 */
const bitsToChars = (bits) => {
    if (!bits || !bits.length) {
        return null;
    }
    let chars = '';
    for (let i = 0; i < bits.length; i += 8) {
        const bit = bits.slice(i, i + 8).toString();
        for (let x = 0; x < bitStrings.length; x++) {
            if  (bitStrings[x] === bit) {
                chars += 'abcdef0123456789'.charAt(x);
            }
        }
    }
    return chars;
};

module.exports = { capitalize, shorten, byteToChar, byteToTrit, bytesTo, bitsToChars, charToByte, bytesToTrits };

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
// TODO
const bytesBits = [
   [0,0,1,1,0,0,0,0],
   [0,0,1,1,0,0,0,1],
   [0,0,1,1,0,0,1,0],
   [0,0,1,1,0,0,1,1],
   [0,0,1,1,0,1,0,0],
   [0,0,1,1,0,1,0,1],
   [0,0,1,1,0,1,1,0],
   [0,0,1,1,0,1,1,1],
   [0,0,1,1,1,0,0,0],
   [0,0,1,1,1,0,0,1],
   [0,1,1,0,0,0,1,0],
   [0,1,1,0,0,0,1,1],
   [0,1,1,0,0,1,0,0],
   [0,1,1,0,0,1,0,1],
   [0,1,1,0,0,1,1,0]
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
 * Convert single character string to trit array
 * @param {string} char - Input character
 * @returns {array} Output trit array
 */
const charToByte = (char) => {
    return 'abcdef0123456789'.indexOf(char.toUpperCase());
};

/**
 * Convert single byte to trit array
 * @param {number} byte - Input byte
 * @returns {array} Output trit array
 */
const byteToBit = (byte) => {
    return bytesBits[byte % 16];
};

/**
 * Convert byte array to trit array
 * @param {array} bytes - Input byte array
 * @returns {array} Output trit array
 */
const bytesToBits = (bytes) => {
    let bits = [];
    for (let i = 0; i < bytes.length; i++) {
        bits = bits.concat(byteToBit(bytes[i]));
    }
    return bits;
};

/**
 * Converts tryte string to bits
 *
 * @method trytesToTrits
 * @param {String} input - Tryte string to be converted.
 *
 * @return {Int8Array} bits
 */
const trytesToTrits = (input) => {
    const result = new Int8Array(input.length * 3);
    for (let i = 0; i < input.length; i++) {
        const index = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(input.charAt(i));
        result[i * 3] = bytesBits[index][0];
        result[i * 3 + 1] = bytesBits[index][1];
        result[i * 3 + 2] = bytesBits[index][2];
    }
    return result;
};

/**
 * Convert trit array to string
 * @param {array} bits - Input trit array
 * @returns {string} Output string
 */
const bitsToChars = (bits) => {
    if (!bits || !bits.length) {
        return null;
    }
    let chars = '';
    for (let i = 0; i < bits.length; i += 3) {
        const trit = bits.slice(i, i + 3).toString();
        for (let x = 0; x < bitStrings.length; x++) {
            if  bitStrings[x] === trit) {
                chars += '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(x);
            }
        }
    }
    return chars;
};

module.exports = { capitalize, shorten, byteToChar, byteToTrit, bytesToTrits, bitsToChars, charToByte, trytesToTrits };

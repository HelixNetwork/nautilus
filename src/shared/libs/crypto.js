import { MAX_SEED_LENGTH } from './hlx/utils';

/**
 * Generates a new seed
 *
 * @method generateNewSeed
 * @param {function} randomTxBytesFn
 *
 * @returns {Promise<string>}
 */
export const generateNewSeed = async (randomTxBytesFn) => {
    const charset = 'abcdef0123456789';
    let seed = '';
    while (seed.length < MAX_SEED_LENGTH) {
        const txByte = await randomTxBytesFn(1);
        // Recheck
        if (txByte[0] < 512) { // 243
            seed += charset.charAt(txByte[0] % 16); // 27
        }
    }
    return seed;
};

/**
 * Randomises seed characters
 *
 * @method randomiseSeedCharacter
 * @param {string} seed
 * @param {number} charId
 * @param {function} randomTxBytesFn
 *
 * @returns {Promise<string>}
 */
export const randomiseSeedCharacter = async (seed, charId, randomTxBytesFn) => {
    const charset = 'abcdef0123456789';
    let updatedSeed = '';
    let complete = false;
    while (!complete) {
        const txByte = await randomTxBytesFn(1);
        if (txByte[0] < 512) { // 243
            updatedSeed = seed.substr(0, charId) + charset.charAt(txByte[0] % 16) + seed.substr(charId + 1, 64);
            complete = true;
        }
    }
    return updatedSeed;
};

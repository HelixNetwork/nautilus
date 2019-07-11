import { MAX_SEED_LENGTH } from './hlx/utils';

/**
 * Generates a new seed
 *
 * @method generateNewSeed
 * @param {function} randomBytesFn
 *
 * @returns {Promise<string>}
 */
export const generateNewSeed = async (randomBytesFn) => {
    const charset = 'abcdef0123456789';
    let seed = '';
    while (seed.length < MAX_SEED_LENGTH) {
        const byte = await randomBytesFn(1);
        // Recheck
        if (byte[0] < 512) { // 243
            seed += charset.charAt(byte[0] % 16); // 27
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
 * @param {function} randomBytesFn
 *
 * @returns {Promise<string>}
 */
export const randomiseSeedCharacter = async (seed, charId, randomBytesFn) => {
    const charset = 'abcdef0123456789';
    let updatedSeed = '';
    let complete = false;
    while (!complete) {
        const byte = await randomBytesFn(1);
        if (byte[0] < 512) { // 243
            updatedSeed = seed.substr(0, charId) + charset.charAt(byte[0] % 16) + seed.substr(charId + 1, 64);
            complete = true;
        }
    }
    return updatedSeed;
};

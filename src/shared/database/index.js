
// Initialise realm instance
let realm = {}; // eslint-disable-line import/no-mutable-exports

// Initialise Realm constructor as null and reinitialise after importing the correct (platform) Realm dependency
let Realm = null;

/**
 * Imports Realm dependency
 *
 * @method getRealm
 * @returns {object}
 */
export const getRealm = () => {
    return Electron.getRealm();
};

/**
 * Model for wallet data and settings.
 */
class Wallet {
    
}
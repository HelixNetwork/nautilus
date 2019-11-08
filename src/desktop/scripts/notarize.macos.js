const { notarize } = require('electron-notarize');
const path = require('path');

exports.default = async () => {
    if (process.platform !== 'darwin') {
        return true;
    }

    const APPLE_ID = process.env.NAUTILUS_APPLE_ID;
    const APPLE_ID_IDENTITY_NAME = process.env.NAUTILUS_APPLE_ID_IDENTITY;

    if (!APPLE_ID) {
        throw Error('Notarization failed: Environment variable "NAUTILUS_APPLE_ID" is not defined');
    }

    if (!APPLE_ID_IDENTITY_NAME) {
        throw Error('Notarization failed: Environment variable "NAUTILUS_APPLE_ID_IDENTITY" is not defined');
    }

    await notarize({
        appBundleId: 'ai.nautilus.wallet',
        appPath: path.resolve(__dirname, '../out/mac/Nautilus Wallet.app'),
        appleId: APPLE_ID,
        appleIdPassword: `@keychain:AC_PASSWORD`,
        ascProvider: 'TM9M2SQ737',
    });
};
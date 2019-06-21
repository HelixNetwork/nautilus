import { availableCurrencies } from '../../libs/currency';
import { defaultNode } from '../../config';

/**
 * Schema for wallet settings.
 */
export const WalletSettingsSchema = {
    name: 'WalletSettings',
    properties: {
        /**
         * Wallet versions (version & build number)
         */
        versions: 'WalletVersions',
        /**
         * Selected locale for wallet.
         */
        locale: {
            type: 'string',
            default: 'en',
        },
        /**
         * Active wallet mode.
         * Could either be "Expert" or "Standard".
         */
        mode: {
            type: 'string',
            default: 'Standard',
        },
        /**
         * Selected language name.
         */
        language: {
            type: 'string',
            default: 'English (International)',
        },
        /**
         * Selected currency for conversions in wallet.
         */
        currency: {
            type: 'string',
            default: 'USD',
        },
        /**
         * Conversion rate for IOTA token.
         */
        conversionRate: {
            type: 'int',
            default: 1,
        },
        availableCurrencies: {
            type: 'list',
            objectType: 'string',
            default: availableCurrencies,
        },
        /**
         * Active theme name.
         */
        themeName: {
            type: 'string',
            default: 'Default',
        },
        /**
         * Determines if the wallet has randomised node on initial setup.
         */
        hasRandomizedNode: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if proof of work should be offloaded to the selected IRI node.
         */
        remotePoW: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if polling should auto promote unconfirmed transactions.
         */
        autoPromotion: {
            type: 'bool',
            default: true,
        },
        /**
         * Determines the time for locking user out of dashboard screens to lock/login screen.
         */
        lockScreenTimeout: {
            type: 'int',
            default: 3,
        },
        /**
         * Determines if wallet should automatically switch to a healthy node in case of errors.
         */
        autoNodeSwitching: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if user has enabled two factor authentication on the wallet.
         */
        is2FAEnabled: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if user has enabled finger print authentication.
         */
        isFingerprintEnabled: {
            type: 'bool',
            default: false,
        },
        /**
         * Keeps track if user has accepted terms and conditions during the initial setup.
         */
        acceptedTerms: {
            type: 'bool',
            default: false,
        },
        /**
         * Keeps track if a user has accepted privacy agreement during the initial setup.
         */
        acceptedPrivacy: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if wallet should hide empty transactions on history screens.
         */
        hideEmptyTransactions: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if the tray app is enabled on desktop wallet.
         */
        isTrayEnabled: {
            type: 'bool',
            default: true,
        },
        /**
         * Determines the status of byte-trit check.
         */
        completedByteTritSweep: {
            type: 'bool',
            default: false,
        },
        /**
         * Notification settings for wallet.
         */
        notifications: 'NotificationsSettings',
        /**
         * Selected IRI node for wallet.
         */
        node: {
            type: 'string',
            default: defaultNode,
        },
        /**
         * Determines the status of AsyncStorage to realm migration
         */
        completedMigration: {
            type: 'bool',
            default: false,
        },
    },
};
export default [
    WalletSettingsSchema
];
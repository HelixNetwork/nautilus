import { availableCurrencies } from '../../libs/currency';
import { DEFAULT_NODE, QUORUM_SIZE } from '../../config';

export const ErrorLogSchema = {
    name: 'ErrorLog',
    properties: {
        error: 'string',
        time: 'int',
    },
};

/**
 * Notifications settings schema
 */
export const NotificationsSettingsSchema = {
    name: 'NotificationsSettings',
    properties: {
        general: {
            type: 'bool',
            default: true,
        },
        confirmations: {
            type: 'bool',
            default: true,
        },
        messages: {
            type: 'bool',
            default: true,
        },
    },
};

export const QuorumConfigSchema = {
    name: 'QuorumConfig',
    properties: {
        size: {
            type: 'int',
            default: QUORUM_SIZE,
        },
        enabled: {
            type: 'bool',
            default: true,
        },
    },
};

/**
 * Schema for Wallet versions.
 */
export const WalletVersionsSchema = {
    name: 'WalletVersions',
    primaryKey: 'version',
    properties: {
        /**
         * Current wallet's version.
         */
        version: {
            type: 'string',
            default: '',
        },
        /**
         * Current wallet's build number (mobile).
         */
        buildNumber: {
            type: 'int',
            optional: true,
        },
    },
};

/**
 * Schema for wallet settings.
 */
export const WalletSettingsSchema = {
    name: 'WalletSettings',
    properties: {
        /**
         * Wallet versions (version & build number)
         */
        versions: {
            type: 'string',
            default: 'WalletVersions',
        },
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
         * Conversion rate for HELIX token.
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
         * Determines the status of txByte-trit check.
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
            default: DEFAULT_NODE.url,
        },

        completedMigration: {
            type: 'bool',
            default: false,
        },

        deepLinking: {
            type: 'bool',
            default: false,
        },
        quorum: 'QuorumConfig',

        autoNodeList: {
            type: 'bool',
            default: true,
        },

        nodeAutoSwitch: {
            type: 'bool',
            default: true,
        },

        ignoreProxy: {
            type: 'bool',
            default: false,
        },
    },
};

/**
 * Schema for account meta
 */
export const AccountMetaSchema = {
    name: 'AccountMeta',
    properties: {
        type: {
            type: 'string',
            default: 'keychain',
        },
        index: {
            type: 'int',
            optional: true,
        },
        page: {
            type: 'int',
            optional: true,
        },
        indexAddress: {
            type: 'string',
            optional: true,
        },
    },
};

export const AccountInfoDuringSetupSchema = {
    name: 'AccountInfoDuringSetup',
    properties: {
        name: {
            type: 'string',
            default: '',
        },
        usedExistingSeed: {
            type: 'bool',
            default: false,
        },
        meta: 'AccountMeta',
        completed: {
            type: 'bool',
            default: false,
        },
    },
};

export const WalletSchema = {
    name: 'Wallet',
    primaryKey: 'version',
    properties: {
        /**
         * Wallet's schema version
         */
        version: {
            type: 'int',
        },
        /**
         * Determines if wallet has completed onboarding.
         */
        onboardingComplete: {
            type: 'bool',
            default: false,
        },
        /**
         * Error notifications log.
         */
        errorLog: 'ErrorLog[]',
        /**
         * Wallet settings.
         */
        settings: 'WalletSettings',
        /**
         * Temporarily stored account information while the account is being setup
         */
        accountInfoDuringSetup: 'AccountInfoDuringSetup',
    },
};

export const AddressSchema = {
    name: 'Address',
    properties: {
        address: 'string',
        index: 'int',
        balance: 'int',
        checksum: 'string',
        spent: 'AddressSpendStatus',
    },
};

export const AddressSpendStatusSchema = {
    name: 'AddressSpendStatus',
    properties: {
        local: 'bool',
        remote: 'bool',
    },
};

export const TransactionSchema = {
    name: 'Transaction',
    properties: {
        hash: 'string',
        signatureMessageFragment: 'string',
        address: 'string',
        value: 'int',
        obsoleteTag: 'string',
        timestamp: 'int',
        currentIndex: 'int',
        lastIndex: 'int',
        tag: 'string',
        trunkTransaction: 'string',
        branchTransaction: 'string',
        bundle: 'string',
        attachmentTimestamp: 'int',
        attachmentTimestampLowerBound: 'int',
        attachmentTimestampUpperBound: 'int',
        nonce: 'string',
        persistence: 'bool',
        broadcasted: { type: 'bool', default: true },
        fatalErrorOnRetry: {
            type: 'bool',
            default: false,
        },
    },
};

export const AccountSchema = {
    name: 'Account',
    primaryKey: 'name',
    properties: {
        meta: 'AccountMeta',
        index: 'int',
        name: 'string',
        addressData: 'Address[]',
        transactions: 'Transaction[]',
        usedExistingSeed: { type: 'bool', default: false },
        displayedSnapshotTransitionGuide: { type: 'bool', default: false },
    },
};

export const NodeSchema = {
    name: 'Node',
    primaryKey: 'url',
    properties: {
        url: {
            type: 'string',
        }, // Node URL
        // Whether the node was added by the user
        custom: {
            type: 'bool',
            default: false,
        },
        pow: { type: 'bool', default: true }, // Whether the node supports remote PoW. //TODO rechange to flase upon implementation of local pow
        /**
         * (Optional) authentication token (username) for node
         */
        token: {
            type: 'string',
            default: '',
        },
        /**
         * (Optional) password for node
         */
        password: {
            type: 'string',
            default: '',
        },
    },
};

export default [
    WalletSchema,
    WalletSettingsSchema,
    NotificationsSettingsSchema,
    QuorumConfigSchema,
    WalletVersionsSchema,
    ErrorLogSchema,
    AccountInfoDuringSetupSchema,
    AccountMetaSchema,
    AccountSchema,
    AddressSchema,
    TransactionSchema,
    AddressSpendStatusSchema,
    NodeSchema,
];

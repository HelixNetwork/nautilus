import unionBy from 'lodash/unionBy';
import { SettingsActionTypes } from '../actions/types';
import { DEFAULT_NODE, DEFAULT_NODES, QUORUM_SIZE } from '../config';
import { availableCurrencies } from '../libs/currency';

export const initialState = {
    /**
     * Selected locale for wallet
     */
    locale: 'en',
    /**
     * Selected language name
     */
    language: 'English (International)',

    node: DEFAULT_NODE,
    /**
     * Sets the remote POW
     */
    remotePoW: false,
    /*
     * Desktop: Use system proxy settings
     */
    ignoreProxy: false,
    /**
     * Determines if polling should auto promote unconfirmed transactions
     */
    autoPromotion: true,
    /**
     * List of IRI nodes
     */
    nodes: DEFAULT_NODES,
    /**
     * List of custom nodes added by user
     */
    customNodes: [],
    /**
     * Active wallet mode
     * Could either be Expert or Standard
     */
    mode: 'Standard',
    quorum: {
        /**
         * User-defined quorum size
         */
        size: QUORUM_SIZE,
        /**
         * Determines if quorum is enabled
         */
        enabled: true,
    },

    nodeAutoSwitch: true,
    autoNodeList: true,
    /**
     * Selected currency for conversions in wallet
     */
    currency: 'USD',
    availableCurrencies,
    /**
     * Active theme name
     */
    themeName: 'Default',
    /**
     * Keeps track if user has accepted terms and conditions during the initial setup
     */
    acceptedTerms: false,
    /**
     * Keeps track if a user has accepted privacy agreement during the initial setup
     */
    acceptedPrivacy: false,
    /**
     * Determines if native OS notifications are enabled
     */
    notifications: {
        general: true,
        confirmations: true,
        messages: true,
    },
    /**
     * Determines the status of AsyncStorage to realm migration
     */
    completedMigration: false,
    /**
     * Determines the time for locking user out of dashboard screens to lock/login screen
     */
    lockScreenTimeout: 3,
};
const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SettingsActionTypes.SET_LOCALE:
            return {
                ...state,
                locale: action.payload,
            };
        case SettingsActionTypes.SET_REMOTE_POW:
            return {
                ...state,
                remotePoW: action.payload,
            };
        case SettingsActionTypes.SET_AUTO_PROMOTION:
            return {
                ...state,
                autoPromotion: action.payload,
            };
        case SettingsActionTypes.UPDATE_THEME:
            return {
                ...state,
                themeName: action.payload,
            };
        case SettingsActionTypes.SET_LANGUAGE:
            return {
                ...state,
                language: action.payload,
            };
        case SettingsActionTypes.UPDATE_QUORUM_CONFIG:
            return {
                ...state,
                quorum: { ...state.quorum, ...action.payload },
            };
        case SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING:
            return {
                ...state,
                nodeAutoSwitch: action.payload,
            };
        case SettingsActionTypes.UPDATE_AUTO_NODE_LIST_SETTING:
            return {
                ...state,
                autoNodeList: action.payload,
            };
        case SettingsActionTypes.SET_PROXY:
            return {
                ...state,
                ignoreProxy: action.payload,
            };
        case SettingsActionTypes.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    [action.payload.type]: action.payload.enabled,
                },
            };
        case SettingsActionTypes.SET_NODELIST:
            return {
                ...state,
                nodes: action.payload,
            };
        case SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS:
            return {
                ...state,
                customNodes: unionBy(state.customNodes, [action.payload], 'url'),
            };
        case SettingsActionTypes.REMOVE_CUSTOM_NODE:
            return {
                ...state,
                customNodes: state.customNodes.filter((node) => node.url !== action.payload),
            };
        case SettingsActionTypes.SET_NODE:
            return {
                ...state,
                node: action.payload,
            };
        case SettingsActionTypes.CURRENCY_DATA_UPDATE:
            return {
                ...state,
                currency: action.payload.currency,
                conversionRate: action.payload.conversionRate,
            };
        case SettingsActionTypes.ACCEPT_NEW_TERMS:
            return {
                ...state,
                newterms: action.payload,
            };
        case SettingsActionTypes.UPDATE_NEW_TERMS_NOTICE:
            return {
                ...state,
                newtermsupdatenotice: action.payload.newTermsNotice,
                newtermsdate: action.payload.newTermsDate,
            };
    }
    return state;
};
export default settingsReducer;

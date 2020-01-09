import i18next from 'libs/i18next';

import { getSelectedNodeFromState, getNodesFromState, getCustomNodesFromState } from 'selectors/global';
import { changeHelixNode, quorum } from 'libs/hlx';
import { SettingsActionTypes } from 'actions/types';
import { generateAlert, generateNodeOutOfSyncErrorAlert, generateUnsupportedNodeErrorAlert } from 'actions/alerts';

import { allowsRemotePow } from 'libs/hlx/extendedApi';
import get from 'lodash/get';
import keys from 'lodash/keys';
import assign from 'lodash/assign';
import unionBy from 'lodash/unionBy';
import { throwIfNodeNotHealthy } from 'libs/hlx/utils';
import Errors from 'libs/errors';
import { Wallet, Node } from '../database';

/**
 * Change wallet's active language
 *
 * @method setLocale
 * @param {string} locale
 *
 * @returns {function} dispatch
 */
export function setLocale(locale) {
    return (dispatch) => {
        i18next.changeLanguage(locale);
        Wallet.updateLocale(locale);
        return dispatch({
            type: SettingsActionTypes.SET_LOCALE,
            payload: locale,
        });
    };
}

/**
 * Change wallet's active theme
 *
 * @method updateTheme
 *
 * @param {string} payload
 *
 * @returns {function} dispatch
 */
export function updateTheme(payload) {
    return (dispatch) => {
        dispatch({
            type: SettingsActionTypes.UPDATE_THEME,
            payload,
        });
    };
}

/**
 * Dispatch when user has accepted wallet's terms and conditions
 *
 * @method acceptTerms
 *
 * @returns {{type: {string} }}
 */
export const acceptTerms = () => {
    Wallet.acceptTerms();
    return {
        type: SettingsActionTypes.ACCEPT_TERMS,
    };
};

/**
 * Dispatch when user has accepted wallet's privacy agreement
 *
 * @method acceptPrivacy
 *
 * @returns {{type: {string} }}
 */
export const acceptPrivacy = () => {
    Wallet.acceptPrivacyPolicy();
    return {
        type: SettingsActionTypes.ACCEPT_PRIVACY,
    };
};

/**
 * Dispatch when user has accepted wallet's new terms
 *
 * @method acceptNewTerms
 *
 * @returns {{type: {string} }}
 */
export const acceptNewTerms = (payload) => {
    Wallet.acceptNewTerms(payload);
    return {
        type: SettingsActionTypes.ACCEPT_NEW_TERMS,
        payload,
    };
};

export const updateNewTermsNotice = (payload) => {
    Wallet.updateNewTermsNotice(payload);
    return {
        type: SettingsActionTypes.UPDATE_NEW_TERMS_NOTICE,
        payload,
    };
};

/**
 * Dispatch to set if native notifications are enabled
 *
 * @method setNotifications
 * @param {{type: {string}, enabled: {boolean}}}} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setNotifications = (payload) => {
    Wallet.updateNotificationsSetting(payload);

    return {
        type: SettingsActionTypes.SET_NOTIFICATIONS,
        payload,
    };
};
/**
 * Dispatch to update proxy settings
 *
 * @method setProxy
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setProxy = (payload) => {
    Wallet.updateIgnoreProxySetting(payload);
    return {
        type: SettingsActionTypes.SET_PROXY,
        payload,
    };
};

/**
 * Dispatch to change selected IRI node
 *
 * @method changeNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeNode = (payload) => (dispatch, getState) => {
    if (getSelectedNodeFromState(getState()) !== payload) {
        dispatch(setNode(payload));
        // Change provider on global helix instance
        changeHelixNode(payload);
    }
};

/**
 * Dispatch to change wallet's active node
 *
 * @method setNode
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setNode = (payload) => {
    Wallet.updateNode(payload.url);

    return {
        type: SettingsActionTypes.SET_NODE,
        payload,
    };
};

/**
 * Dispatch to change wallet's active node
 *
 * @method updateHelixUnit
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const updateHelixUnit = (payload) => {
    return {
        type: SettingsActionTypes.UPDATE_HELIX_UNIT,
        payload,
    };
};

/**
 * Makes an API call to check if a node is healthy/active and then changes the selected node for wallet
 *
 * @method setFullNode
 *
 * @param {object} node - { url, token }
 * @param {boolean} addingCustomNode
 *
 * @returns {function}
 */
export function setFullNode(node, addingCustomNode = false) {
    const dispatcher = {
        request: addingCustomNode ? addCustomNodeRequest : setNodeRequest,
        success: addingCustomNode ? addCustomNodeSuccess : setNode,
        error: addingCustomNode ? addCustomNodeError : setNodeError,
        alerts: {
            defaultError: (err) =>
                addingCustomNode
                    ? generateAlert(
                          'error',
                          i18next.t('addCustomNode:customNodeCouldNotBeAdded'),
                          i18next.t('addCustomNode:invalidNodeResponse'),
                          7000,
                      )
                    : generateAlert(
                          'error',
                          i18next.t('settings:nodeChangeError'),
                          i18next.t('settings:nodeChangeErrorExplanation'),
                          7000,
                          err,
                      ),
        },
    };

    return (dispatch) => {
        dispatch(dispatcher.request());
        throwIfNodeNotHealthy(node)
            .then(() => allowsRemotePow(node))
            .then((hasRemotePow) => {
                // Change Helix provider on the global helix instance
                if (!addingCustomNode) {
                    changeHelixNode(assign({}, node, { provider: node.url }));
                }

                // Update node in redux store
                dispatch(
                    dispatcher.success(
                        assign({}, node, {
                            pow: hasRemotePow,
                        }),
                        hasRemotePow,
                    ),
                );

                if (addingCustomNode) {
                    return dispatch(
                        generateAlert(
                            'success',
                            i18next.t('global:customNodeAdded'),
                            i18next.t('global:customNodeAddedExplanation', { node: node.url }),
                            10000,
                        ),
                    );
                }

                if (hasRemotePow) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessExplanation', { node: node.url }),
                            10000,
                        ),
                    );
                } else {
                    // Automatically default to local PoW if this node has no attach to tangle available
                    dispatch(setRemotePoW(false));
                    dispatch(setAutoPromotion(false));

                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessNoRemotePow', { node: node.url }),
                            10000,
                        ),
                    );
                }
            })
            .catch((err) => {
                dispatch(dispatcher.error());

                if (get(err, 'message') === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert(err));
                } else if (get(err, 'message') === Errors.NODE_NOT_SYNCED_BY_TIMESTAMP) {
                    dispatch(generateNodeOutOfSyncErrorAlert(err, true));
                } else if (get(err, 'message') === Errors.UNSUPPORTED_NODE) {
                    dispatch(generateUnsupportedNodeErrorAlert(err));
                } else {
                    dispatch(dispatcher.alerts.defaultError(err));
                }
            });
    };
}

/**
 * Makes an API call for checking if attachToTangle is enabled on the selected IRI node
 * and changes proof of work configuration for wallet
 *
 * @method changePowSettings
 *
 * @returns {function}
 */
export function changePowSettings() {
    return (dispatch, getState) => {
        const settings = getState().settings;
        if (!settings.remotePoW) {
            allowsRemotePow(settings.node).then((hasRemotePow) => {
                if (!hasRemotePow) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanationShort'),
                            10000,
                        ),
                    );
                }
                dispatch(setRemotePoW(!settings.remotePoW));
                dispatch(generateAlert('success', i18next.t('pow:powUpdated'), i18next.t('pow:powUpdatedExplanation')));
            });
        } else {
            dispatch(setRemotePoW(!settings.remotePoW));
            dispatch(generateAlert('success', i18next.t('pow:powUpdated'), i18next.t('pow:powUpdatedExplanation')));
        }
    };
}
/**
 * Dispatch to update proof of work configuration for wallet
 *
 * @method setRemotePoW
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setRemotePoW = (payload) => {
    Wallet.updateRemotePowSetting(payload);
    return {
        type: SettingsActionTypes.SET_REMOTE_POW,
        payload,
    };
};

/**
 * Dispatch when a network call is about to be made for checking node's health during node change operation
 *
 * @method setNodeRequest
 *
 * @returns {{type: {string} }}
 */
const setNodeRequest = () => ({
    type: SettingsActionTypes.SET_NODE_REQUEST,
});

/**
 * Dispatch when an error occurs while checking node's health during node change operation
 *
 * @method setNodeError
 *
 * @returns {{type: {string} }}
 */
const setNodeError = () => ({
    type: SettingsActionTypes.SET_NODE_ERROR,
});

/**
 * Dispatch when a network call is about to be made for checking health of newly added IRI node
 *
 * @method addCustomNodeRequest
 *
 * @returns {{type: {string} }}
 */
const addCustomNodeRequest = () => ({
    type: SettingsActionTypes.ADD_CUSTOM_NODE_REQUEST,
});

/**
 * Dispatch when the newly added custom node is healthy (synced)
 *
 * @method addCustomNodeSuccess
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const addCustomNodeSuccess = (payload) => {
    Node.addCustomNode(payload);
    return {
        type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
        payload,
    };
};

/**
 * Dispatch when an error occurs during health check for newly added custom node
 *
 * @method addCustomNodeError
 *
 * @returns {{type: {string} }}
 */
const addCustomNodeError = () => ({
    type: SettingsActionTypes.ADD_CUSTOM_NODE_ERROR,
});

/**
 * Dispatch to set a randomly selected node as the active node for wallet
 *
 * @method setRandomlySelectedNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setRandomlySelectedNode = (payload) => {
    Wallet.setRandomlySelectedNode(payload);

    return {
        type: SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE,
        payload,
    };
};

/**
 * Dispatch to set updated list of IRI nodes for wallet
 *
 * @method setNodeList
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setNodeList = (payload) => {
    Node.addNodes(payload);

    return {
        type: SettingsActionTypes.SET_NODELIST,
        payload,
    };
};

/**
 * Dispatch to update auto promotion configuration for wallet
 *
 * @method setAutoPromotion
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setAutoPromotion = (payload) => {
    Wallet.updateAutoPromotionSetting(payload);

    return {
        type: SettingsActionTypes.SET_AUTO_PROMOTION,
        payload,
    };
};

/**
 * Dispatch when a network call for fetching currency information (conversion rates) is about to be made
 *
 * @method currencyDataFetchRequest
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchRequest = () => ({
    type: SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST,
});

/**
 * Dispatch when there is an error fetching currency information
 *
 * @method currencyDataFetchError
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchError = () => ({
    type: SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR,
});

/**
 * Dispatch when currency information (conversion rates) is about to be fetched
 *
 * @method currencyDataFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const currencyDataFetchSuccess = (payload) => {
    Wallet.updateCurrencyData(payload);

    return {
        type: SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
        payload,
    };
};
/**
 * Dispatch when currency information (conversion rates) is about to be fetched
 *
 * @method currencyDataFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {objec} }}
 */
export const currencyDataUpdate = (payload) => {
    return {
        type: SettingsActionTypes.CURRENCY_DATA_UPDATE,
        payload,
    };
};
/**
 * Makes an API call for checking if attachToTangle is enabled on the selected IRI node
 * and changes auto promotion configuration for wallet
 *
 * @method changeAutoPromotionSettings
 *
 * @returns {function}
 */
export function changeAutoPromotionSettings() {
    return (dispatch, getState) => {
        const settings = getState().settings;
        if (!settings.autoPromotion) {
            allowsRemotePow(settings.node).then((hasRemotePow) => {
                if (!hasRemotePow) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanationShort'),
                            10000,
                        ),
                    );
                }
                dispatch(setAutoPromotion(!settings.autoPromotion));
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('autoPromotion:autoPromotionUpdated'),
                        i18next.t('autoPromotion:autoPromotionUpdatedExplanation'),
                    ),
                );
            });
        } else {
            dispatch(setAutoPromotion(!settings.autoPromotion));
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('autoPromotion:autoPromotionUpdated'),
                    i18next.t('autoPromotion:autoPromotionUpdatedExplanation'),
                ),
            );
        }
    };
}
/**
 * Fetch currency information (conversion rates) for wallet
 *
 * @method getCurrencyData
 *
 * @param {string} currency
 * @param {boolean} withAlerts
 *
 * @returns {function(*): Promise<any>}
 */
export function getCurrencyData(currency, withAlerts = false) {
    const url = 'https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD';
    return (dispatch) => {
        dispatch(currencyDataFetchRequest());

        return fetch(url)
            .then(
                (response) => response.json(),
                () => {
                    dispatch(currencyDataFetchError());

                    if (withAlerts) {
                        dispatch(
                            generateAlert(
                                'error',
                                i18next.t('settings:couldNotFetchRates'),
                                i18next.t('settings:couldNotFetchRatesExplanation', {
                                    currency: currency,
                                }),
                            ),
                        );
                    }
                },
            )
            .then((json) => {
                const conversionRate = get(json, `rates.${currency}`) || 1;
                const availableCurrencies = keys(get(json, 'rates'));

                const payload = { conversionRate, currency, availableCurrencies };

                // Update redux
                dispatch(currencyDataFetchSuccess(payload));
                dispatch(currencyDataUpdate(payload));
                if (withAlerts) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:fetchedConversionRates'),
                            i18next.t('settings:fetchedConversionRatesExplanation', {
                                currency: currency,
                            }),
                        ),
                    );
                }
            });
    };
}

/**
 * Dispatch to show/hide empty transactions in transactions history
 *
 * @method toggleEmptyTransactions
 *
 * @returns {{type: {string} }}
 */
export const toggleEmptyTransactions = () => {
    Wallet.toggleEmptyTransactionsDisplay();

    return {
        type: SettingsActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
    };
};

/**
 * Dispatch to update autoNodeList setting
 *
 * @method updateAutoNodeListSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateAutoNodeListSetting = (payload) => {
    // Update autoNodeList setting in realm
    Wallet.updateAutoNodeListSetting(payload);

    // Update autoNodeList setting in redux
    return {
        type: SettingsActionTypes.UPDATE_AUTO_NODE_LIST_SETTING,
        payload,
    };
};

/**
 * Dispatch to change autoNodeList setting
 *
 * @method changeAutoNodeListSetting
 *
 * @param {boolean} payload
 *
 * @returns {function} dispatch
 */
export const changeAutoNodeListSetting = (payload) => (dispatch, getState) => {
    dispatch(updateAutoNodeListSetting(payload));

    // `autoNodeList` active -> use all nodes for quorum
    // `autoNodeList` inactive -> use custom nodes for quorum
    const remoteNodes = getNodesFromState(getState());
    const customNodes = getCustomNodesFromState(getState());
    const nodes = payload ? unionBy(remoteNodes, customNodes, 'url') : customNodes;

    quorum.setNodes(nodes);
};

/**
 * Dispatch to update node auto-switch setting
 *
 * @method updateNodeAutoSwitchSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateNodeAutoSwitchSetting = (payload) => {
    // Update auto node switching setting in realm

    Wallet.updateNodeAutoSwitchSetting(payload);

    // Update auto node switching setting in redux store
    return {
        type: SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING,
        payload,
    };
};
/**
 * Dispatch to update quorum configuration
 *
 * @method updateQuorumConfig
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateQuorumConfig = (payload) => {
    // Update quorum configuration in realm
    Wallet.updateQuorumConfig(payload);

    // Check if this update aims to update quorum size
    const quorumSize = get(payload, 'size');

    // If this update aims to update quorum size, also update global quorum parameter
    if (quorumSize) {
        quorum.setSize(quorumSize);
    }

    // Finally, update it in redux store
    return {
        type: SettingsActionTypes.UPDATE_QUORUM_CONFIG,
        payload,
    };
};
/**
 * Dispatch to remove an added custom node from wallet
 *
 * @method removeCustomNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeCustomNode = (payload) => {
    Node.delete(payload);

    return {
        type: SettingsActionTypes.REMOVE_CUSTOM_NODE,
        payload,
    };
};

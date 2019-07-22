import assign from 'lodash/assign';
import has from 'lodash/has';
import filter from 'lodash/filter';
import { createSelector } from 'reselect';
import Themes from '../themes/themes';
import { DEFAULT_NODE } from '../config';
/**
 *   Selects settings prop from state.
 *
 *   @method getSettingsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSettingsFromState = (state) => state.settings || {};

/**
 * Selects active theme name from state.settings
 */
export const getThemeNameFromState = createSelector(getSettingsFromState, (state) => state.themeName);

/**
 * Selects active theme object
 */
export const getThemeFromState = createSelector(
    getThemeNameFromState,
    (themeName) => Themes[themeName] || Themes.Default,
);

export const getWalletFromState = (state) => state.wallet || {};

export const getSeedIndexFromState = createSelector(
    getWalletFromState,
    (state) => state.seedIndex || 0,
);

/**
 * Gets configuration for node manager from state.
 *
 * @method nodesConfigurationFactory
 *
 * @param {object} overrides
 *
 * @returns {object}
 **/
export const nodesConfigurationFactory = (overrides) =>

    createSelector(
        getSettingsFromState,
        (state) => {
            console.log("Function===",getSettingsFromState);

            console.log("State===", state);

            const config = {
                /** Node that should be given priority while connecting. */
                priorityNode: DEFAULT_NODE,
                /**
                 * Wallet nodes
                 * autoNodeList (true) -> choose random nodes from all nodes for auto-retrying
                 * autoNodeList(false) -> choose random nodes from only custom nodes for auto-retrying
                 */
                nodes: state.autoNodeList ? [...state.nodes, ...state.customNodes] : state.customNodes,
                /** Wallet's active node */
                primaryNode: state.node,
                /** Determines if quorum is enabled/disabled */
                quorum: state.quorum,
                /**
                 * Determines if (primary) node should automatically be auto-switched
                 */
                nodeAutoSwitch: state.nodeAutoSwitch,
                /**
                 * - When true: pull in nodes from endpoint (config#NODELIST_URL) and include the custom nodes in the quorum selection
                 * - When false: only use custom nodes in quorum selection
                 */
                autoNodeList: state.autoNodeList,
            };

            console.log("config", config);

            const shouldOverrideQuorumConfig = has(overrides, 'quorum');
            const shouldUseOnlyPowNodes = has(overrides, 'useOnlyPowNodes');

            if (
                shouldOverrideQuorumConfig &&
                // Only allow quorum override if user has explicitly turned on quorum (or if it is turned off as default)
                // If a user has disabled quorum, then no quorum should be executed at any place in the application
                config.quorum.enabled === true
            ) {
                config.quorum = assign({}, config.quorum, { enabled: overrides.quorum });
            }

            if (shouldUseOnlyPowNodes) {
                config.nodes = filter(config.nodes, (node) => node.pow === true);
            }

            return config;
        },
    );
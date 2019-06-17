import assign from 'lodash/assign';
import { composeAPI } from '@helixnetwork/core'
// TODO
// import IOTA from 'iota.lib.js';
import 'proxy-polyfill';
import Quorum from './quorum';
import { DEFAULT_NODE, DEFAULT_NODES, DEFAULT_NODE_REQUEST_TIMEOUT, QUORUM_SIZE } from '../../config';

/** Globally defined HELIX instance */
const helixAPI =  composeAPI({
    provider:DEFAULT_NODE.url
});

// Set node request timeout
// TODO
// helixAPI.api.setApiTimeout(DEFAULT_NODE_REQUEST_TIMEOUT);
IOTA
/** Globally defined Quorum instance */
export const quorum = new Quorum({
    nodes: DEFAULT_NODES,
    quorumSize: QUORUM_SIZE,
});

/**
 * Changes Helix node
 *
 * @method changeHelixNode
 *
 * @param {object} settings
 *
 * @returns {void}
 */
export const changeHelixNode = (NODE_URI) => {
    helixAPI =  composeAPI({
        provider:NODE_URI
    });
};

export const helix = helixAPI;

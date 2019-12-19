import { composeAPI } from '@helixnetwork/core';
import 'proxy-polyfill';
import Quorum from './quorum';
import { DEFAULT_NODE, DEFAULT_NODES, DEFAULT_NODE_REQUEST_TIMEOUT, QUORUM_SIZE } from '../../config';

/** Globally defined HELIX instance */
let helixAPI = composeAPI({
    provider: DEFAULT_NODE.url,
    timeout: DEFAULT_NODE_REQUEST_TIMEOUT,
});

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
    helixAPI = composeAPI({
        provider: NODE_URI,
        timeout: DEFAULT_NODE_REQUEST_TIMEOUT,
    });
};

export const helix = helixAPI;

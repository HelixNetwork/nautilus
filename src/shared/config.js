export const __DEV__ = process.env.NODE_ENV === 'development';
export const __TEST__ = process.env.NODE_ENV === 'test';
/** Default IRI node object */
export const DEFAULT_NODE = __TEST__
    ? {
        url: 'http://localhost:14265',
        pow: false,
        token: '',
        password: '',
    }
    : {
        url:'http://13.234.122.84:8087',
        pow: true,
        token: '',
        password: '',
    };
// url: 'https://hlxtest.net:8087',
export const NODES_WITH_POW_DISABLED = [
    'https://hlxtest.net:8088',
].map((url) => ({
    url,
    pow: false,
    token: '',
    password: '',
}));
// TODO

export const NODES_WITH_POW_ENABLED = [
    'https://hlxtest.net:8087',
    'https://node1.hlxtest.net:8087',
    'https://node2.hlxtest.net:8087',
    'https://node3.hlxtest.net:8087',
    'https://node4.hlxtest.net:8087',

].map((url) => ({
    url,
    pow: true,
    token: '',
    password: '',
}));

export const DEFAULT_NODES = [...NODES_WITH_POW_DISABLED, ...NODES_WITH_POW_ENABLED];
// TODO
export const NODELIST_URL = '';
// export const NODELIST_URL = '';

// TODO
export const VERSIONS_URL =
    '';

export const DEFAULT_DEPTH = 2; // 4
export const DEFAULT_MIN_WEIGHT_MAGNITUDE = 2; // 14
export const DEFAULT_TAG = '48454c4958'; // HELIX
export const DEFAULT_SECURITY = 2;
export const DEFAULT_BALANCES_THRESHOLD = 100;

export const BUNDLE_OUTPUTS_THRESHOLD = 50;

export const MAX_REQUEST_TIMEOUT = 60 * 1000 * 2;

export const DEFAULT_NODE_REQUEST_TIMEOUT = 6000 * 2;
export const GET_NODE_INFO_REQUEST_TIMEOUT = 2500;
export const GET_BALANCES_REQUEST_TIMEOUT = 6000;
export const WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT = 4000;
export const ATTACH_TO_TANGLE_REQUEST_TIMEOUT = 25000;
export const GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT = 40000;

export const DEFAULT_RETRIES = 4;

export const IRI_API_VERSION = '1';

// TODO Recheck Quorum size

export const QUORUM_THRESHOLD = 66; //66
export const QUORUM_SIZE = 3; //3
export const QUORUM_SYNC_CHECK_INTERVAL = 120;
export const MINIMUM_QUORUM_SIZE = 2; // 2
export const MAXIMUM_QUORUM_SIZE = 7; // 7

/** Maximum milestone fallbehind threshold for node sync checks */
export const MAX_MILESTONE_FALLBEHIND = 2;

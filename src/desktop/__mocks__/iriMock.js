import { asTransactionStrings, asTransactionObject } from '@helixnetwork/transaction-converter';

export default (request) => {
    if (request.method() === 'OPTIONS') {
        return request.respond(
            request.respond({
                status: 200,
                contentType: 'text/plain',
                headers: {
                    'access-control-allow-headers': 'content-type,X-HELIX-API-Version',
                    'access-control-allow-methods': 'GET, POST, OPTIONS',
                    'access-control-allow-origin': '*',
                },
            }),
        );
    }

    if (request.resourceType() !== 'xhr' || request.method() !== 'POST') {
        return request.continue();
    }

    const postData = JSON.parse(request.postData());

    let body = {};

    // eslint-disable-next-line default-case
    switch (postData.command) {
        case 'getNodeInfo':
            body = {
                appName: 'Pendulum',
                appVersion: '0.0.0-MOCK',
                currentRoundIndex: 70274,
                latestSolidRoundHash: '002adac982d3ff7611b52e1f32ccede325b54ee17f5745c2d9e46a65bb1dce14',
                latestSolidRoundIndex: 70273,
                roundStartIndex: 19218,
                lastSnapshottedRoundIndex: 69217,
                time: Number(new Date()),
                features: ['RemotePOW'],
            };
            break;

        case 'wereAddressesSpentFrom':
            body = { states: Array(postData.addresses.length).fill(false) };
            break;

        case 'getBalances':
            body = { balances: Array(postData.addresses.length).fill(0) };
            break;

        case 'getTransactionStrings': {
            const transactionObject = asTransactionObject('0'.repeat(1536));
            const txs = asTransactionStrings(Object.assign({}, transactionObject, { timestamp: Date.now() }));
            body = { txs: Array(postData.hashes.length).fill(txs) };
            break;
        }
        case 'findTransactions':
            body = { txs: Array(postData.addresses.length).fill('0'.repeat(64)) };
            break;
    }

    request.respond({
        status: 200,
        contentType: 'application/json',
        headers: {
            'access-control-allow-origin': '*',
        },
        body: JSON.stringify(body),
    });
};

// import { asTransactionObject ,asTransactionStrings } from "@helixnetwork/transaction-converter";

// export default (request) => {
//     if (request.method() === 'OPTIONS') {
//         return request.respond(
//             request.respond({
//                 status: 200,
//                 contentType: 'text/plain',
//                 headers: {
//                     'access-control-allow-headers': 'content-type,x-helix-api-version',
//                     'access-control-allow-methods': 'GET, POST, OPTIONS',
//                     'access-control-allow-origin': '*',
//                 },
//             }),
//         );
//     }

//     if (request.resourceType() !== 'xhr' || request.method() !== 'POST') {
//         return request.continue();
//     }

//     const postData = JSON.parse(request.postData());

//     let body = {};

//     switch (postData.command) {
//         case 'getNodeInfo':
//             body = {
//                 appName: 'IRI',
//                 appVersion: '0.0.0-MOCK',
//                 latestMilestone: 'a'.repeat(64),
//                 latestMilestoneIndex: 426550,
//                 latestSolidSubtangleMilestone:
//                     'b'.repeat(64),
//                 latestSolidSubtangleMilestoneIndex: 426550,
//                 time: Number(new Date()),
//                 features: ['RemotePOW'],
//             };
//             break;

//         case 'wereAddressesSpentFrom':
//             body = { states: Array(postData.addresses.length).fill(false) };
//             break;

//         case 'getBalances':
//             body = { balances: Array(postData.addresses.length).fill(0) };
//             break;

//         case 'getTransactionStrings': {
//             const transactionObject = asTransactionObject('0'.repeat(1536));
//             const txs = asTransactionStrings(
//                 Object.assign({}, transactionObject, { timestamp: Date.now() }),
//             );
//             body = { txs: Array(postData.hashes.length).fill(txs) };
//             break;
//         }
//         case 'findTransactions':
//             body = { txs: Array(postData.addresses.length).fill('0'.repeat(64)) };
//             break;
//     }

//     request.respond({
//         status: 200,
//         contentType: 'application/json',
//         headers: {
//             'access-control-allow-origin': '*',
//         },
//         body: JSON.stringify(body),
//     });
// };

const fork = require('child_process').fork;
const path = require('path');

// import { powTrytesFunc, powBundleFunc, genAddressTritsFunc } from 'entangled-node';
import { generateAddress } from "@helixnetwork/core";
import { bitsToChars, indexToBit } from 'libs/hlx/converter';

let timeout = null;

/**
 * Spawn a child process and return result in async
 * @param {object} payload - Payload to send to the child process
 * @returns {Promise}
 */
const exec = (payload) => {
    return new Promise((resolve, reject) => {
        const child = fork(path.resolve(__dirname, 'helixTangled.js'));

        child.on('message', (message) => {
            resolve(message);

            clearTimeout(timeout);
            child.kill();
        });

        timeout = setTimeout(() => {
            reject('Timeout here');
            child.kill();
        }, 30000);

        child.send(payload);
    });
};

/**
 * If module called as a child process, execute requested function and return response
 */
process.on('message', async (data) => {
    const payload = JSON.parse(data);
    if (payload.job === 'genAddress') {
        let hexSeed = bitsToChars(payload.seed);
        const addresses = await generateAddress(hexSeed, payload.index, payload.security);
        process.send(addresses);
    }
});

const HelixTangled = {
    genFn: async (seed, index, security) => {
        return await exec(JSON.stringify({ job: 'genAddress', seed, index, security }));
    },
};

export default HelixTangled;
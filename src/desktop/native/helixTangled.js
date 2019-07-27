import { fork } from 'child_process';
import path from 'path';
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
    console.log("helix tangled payload", payload);
    return new Promise((resolve, reject) => {
        const child = fork(path.resolve(__dirname, 'helixTangled.js'));

        child.on('message', (message) => {
            resolve(message);

            clearTimeout(timeout);
            child.kill();
        });

        timeout = setTimeout(() => {
            reject('Timeout');
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

    // if (payload.job === 'pow') {
    //     const pow = await powTrytesFunc(payload.trytes, payload.mwm);
    //     process.send(pow);
    // }

    // if (payload.job === 'batchedPow') {
    //     const pow = await powBundleFunc(
    //         payload.trytes,
    //         payload.trunkTransaction,
    //         payload.branchTransaction,
    //         payload.mwm,
    //     );
    //     process.send(pow);
    // }

    if (payload.job === 'genAddress') {
        console.log("helix tangled", payload);
        let hexSeed = bitsToChars(payload.seed);
        let addresses = []
        for (let k =0;k<options.total;k++){
            addresses[k] = await generateAddress(hexSeed, options.index + k, options.security);
        }
        process.send(addresses);
    }
});

const HelixTangled = {
    genFn: async (seed, index, security) => {
        return await exec(JSON.stringify({ job: 'genAddress', seed, index, security }));
    },
};

export default HelixTangled;
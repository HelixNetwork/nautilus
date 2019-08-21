const fork = require("child_process").fork;
const path = require("path");

import { generateAddress } from "@helixnetwork/core";
import { bitsToChars, indexToBit } from "libs/hlx/converter";
import { processLocalPow , powTx } from "@helixnetwork/pow";
let timeout = null;

/**
 * Spawn a child process and return result in async
 * @param {object} payload - Payload to send to the child process
 * @returns {Promise}
 */

const exec = (payload) => {
  return new Promise((resolve, reject) => {
      const child = fork(path.resolve(__dirname, 'helixTangled.js'));

      const { job } = JSON.parse(payload);

      child.on('message', (message) => {
          resolve(message);

          clearTimeout(timeout);
          child.kill();
      });

      timeout = setTimeout(
          () => {
              reject(`Timeout: HelixTangled job: ${job}`);
              child.kill();
          },
          job === 'batchedPow' ? 180 * 1000 : 80 * 1000,
      );

      child.send(payload);
  });
};

/**
 * If module called as a child process, execute requested function and return response
 */
process.on("message", async data => {
  const payload = JSON.parse(data);
console.log("payload=",payload);


  if (payload.job === 'pow') {
    // const pow = await EntangledNode.powTrytesFunc(payload.trytes, payload.mwm);
    // TODO, payload.txs may be string where it is expected to be unit8Array
    const pow = await powTx(payload.txs, payload.mwm);
    process.send(pow);
}

if (payload.job === 'batchedPow') {
  
    const pow = await processLocalPow(
        payload.trunkTransaction,
        payload.branchTransaction,
        payload.mwm,
        payload.txs
    );
    process.send(pow);
}

  if (payload.job === "genAddress") {
    // Recheck
    // This currently may be an unoptimal way to generate Addresses.
    let hexSeed = bitsToChars(payload.seed);
    const addresses = await generateAddress(
      hexSeed,
      payload.index,
      payload.security
    );
    process.send(addresses);
  }
});

const HelixTangled = {
  powFn: async (txs, mwm) => {
    return await exec(JSON.stringify({ job: 'pow', txs, mwm }));
},
  batchedPowFn: async (txs, trunkTransaction, branchTransaction, mwm) => {
    return await exec(JSON.stringify({ job: 'batchedPow', txs, trunkTransaction, branchTransaction, mwm }));
},
  genFn: async (seed, index, security) => {
    return await exec(
      JSON.stringify({ job: "genAddress", seed, index, security })
    );
 }
};

export default HelixTangled;

/* global Electron */
import { performPow } from 'libs/hlx/transfers';
import {
    asTransactionObject
} from "@helixnetwork/transaction-converter"
export default class SeedStoreCore {
    /**
     * Performs proof-of-works on provided trytes
     *
     * @method performPow
     *
     * @param {array} TxBytes
     * @param {string} trunkTransaction
     * @param {string} branchTransaction
     * @param {number} minWeightMagnitude
     * @param {boolean} batchedPow
     *
     * @returns {Promise<object>}
     */
    performPow(TxBytes, trunkTransaction, branchTransaction, minWeightMagnitude, batchedPow = true) {
        const powFn = Electron.getPowFn(batchedPow);
        return performPow(
            powFn,
            this.getDigest,
            TxBytes,
            trunkTransaction,
            branchTransaction,
            minWeightMagnitude,
            batchedPow,
        );
    }

    /**
     * Gets digest for provided TxBytes
     *
     * @method getDigest
     *
     * @param {string} TxBytes
     *
     * @returns {Promise<string>}
     */
    getDigest=async(TxBytes)=> {
        console.log("here sa =", TxBytes);
        try{
          let result =  await asTransactionObject(TxBytes);
          console.log("result",result);
        return await asTransactionObject(TxBytes).hash;
      }
      catch(err){
        console.log('eerererere',err);
      }
    }
}

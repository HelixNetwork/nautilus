/* global Electron */
import { performPow } from 'libs/hlx/transfers';
import {

} from "libs/hlx"
export default class SeedStoreCore {
    /**
     * Performs proof-of-works on provided trytes
     *
     * @method performPow
     *
     * @param {array} hbytes
     * @param {string} trunkTransaction
     * @param {string} branchTransaction
     * @param {number} minWeightMagnitude
     * @param {boolean} batchedPow
     *
     * @returns {Promise<object>}
     */
    performPow(hbytes, trunkTransaction, branchTransaction, minWeightMagnitude, batchedPow = true) {
        const powFn = Electron.getPowFn(batchedPow);
        return performPow(
            powFn,
            this.getDigest,
            hbytes,
            trunkTransaction,
            branchTransaction,
            minWeightMagnitude,
            batchedPow,
        );
    }

    /**
     * Gets digest for provided hbytes
     *
     * @method getDigest
     *
     * @param {string} hbytes
     *
     * @returns {Promise<string>}
     */
    getDigest(hbytes) {
        return Promise.resolve(astransactionObject(hbytes).hash);
    }
}

import {asciiToHBytes} from "@helixnetwork/converter";
import { composeAPI } from "@helixnetwork/core";
// getHelixInstance,
// getApiTimeout,
// getBalancesAsync,
// getTransactionsObjectsAsync,
// findTransactionObjectsAsync,
// getLatestInclusionAsync,
// promoteTransactionAsync,
// replayBundleAsync,
// getBundleAsync,
// wereAddressesSpentFromAsync,
// sendTransferAsync,
// getTransactionsToApproveAsync,
// storeAndBroadcastAsync,
// attachToTangle,
// checkAttachToTangleAsync,
// allowsRemotePow,
// isNodeHealthy,
// isPromotable,
/**
 * This class consist of helix Api wrappers to interact with helix network
 */
export default class HelixApi {

    /**
     * Initialises the helix wrappers
     * @param {String} provider endpoint to connect to helix node
     */
    constructor(provider) {
        this.helix = composeAPI({
            provider,
          }); getHelixInstance,
          getApiTimeout,
          getBalancesAsync,
          getNodeInfoAsync,
          getTransactionsObjectsAsync,
          findTransactionObjectsAsync,
          findTransactionsAsync,
          getLatestInclusionAsync,
          promoteTransactionAsync,
          replayBundleAsync,
          getBundleAsync,
          wereAddressesSpentFromAsync,
          sendTransferAsync,
          getTransactionsToApproveAsync,
          storeAndBroadcastAsync,
          attachToTangle,
          checkAttachToTangleAsync,
          allowsRemotePow,
          isNodeHealthy,
          isPromotable,
    }

   

  /**
   * @method getNodeInfo
   * @return {Promise}
   * @fulfil {NodeInfo} Object with information about connected node.
   * @reject {Error}
   * - Fetch error
   */
    getNodeInfo = () => {
    return new Promise(async (resolve, reject) => {
      try {
      const result = await this.helix.getNodeInfo();
      resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }
    /**
     * @method CreateTransaction
     * @param  {hex} address
     * @param  {number} value
     * @param  {string} message
     * @param  {string} tag
     * @param  {string} seed 
     * @param  {number} depth
     * @param  {number} mwm Minimum Weight magnitude
     */
    createTransaction= (
        address,
        value,
        message,
        tag,
        seed,
        depth,
        mwm,
      ) => {
        return new Promise(async (resolve, reject) => {
          try {
          const transfer = [
            {
              address,
              message : asciiToHBytes(message),
              tag : asciiToHBytes(tag),
              value,
            },
          ];

          const result = await this.helix.prepareTransfers(seed, transfer).then((bytes) => {
            return this.helix.sendHBytes(bytes, depth, mwm);
          });

          resolve(result);

        } catch (err) {
          reject(err);
        }
        });
      }

    /**
     *
     * @method findTransactions
     *
     *
     * @param {Hash[]} [addresses] - List of addresses
     * @param {Hash[]} [bundles] - List of bundle hashes
     * @param {Tag[]} [tags] - List of tags
     * @returns {Promise}
     * @fulfil {Hash[]} Array of transaction hashes
     * @reject {Error}
     * - `INVALID_SEARCH_KEY`
     * - `INVALID_HASH`: Invalid bundle hash
     * - `INVALID_TRANSACTION_HASH`: Invalid approvee transaction hash
     * - `INVALID_ADDRESS`: Invalid address
     * - `INVALID_TAG`: Invalid tag
     * - Fetch error
     */

   findTransactions = (
        addresses,
        bundles,
        tags,
    ) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await this.helix.findTransactions({
            addresses,
            bundles,
            tags,
            });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

    }

    /**
     * @method getBalance
     *
     * @param {Array<String>} address -list of addresses
     *
     * @returns {Promise}
     *
     * @fulfil {Balances} Object with list of `balances` and corresponding `milestone`
     * @reject {Error}
     * - `INVALID_HASH`: Invalid address
     * - `INVALID_THRESHOLD`: Invalid `threshold`
     * - Fetch error
     */

    getBalance = (address) => {
        return new Promise(async (resolve , reject) => {
          try {
            const result = await this.helix.getBalances(address, 100);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
    }

    /**
     *
     * @method getInclusionStates
     *
     * @param {Hash[]} transactions - List of transaction hashes
     * @param {Hash[]} tips - List of tips to check if transactions are referenced by
     *
     * @return {Promise}
     * @fulfil {boolean[]} Array of inclusion state
     * @reject {Error}
     * - `INVALID_TRANSACTION_HASH`: Invalid `hashes` or `tips`
     * - Fetch error
     */

     getInclusionStates = (
        transaction,
        tips,
    ) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await this.helix.getInclusionStates(transaction, tips);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    }

    /**
     *
     * @method getBytes
     *
     * @param {Array<String>} transaction -list of transactions
     *
     * @return {Promise}
     * @fulfil {Trytes[]} - Transaction trytes
     * @reject Error{}
     * - `INVALID_TRANSACTION_HASH`: Invalid hash
     * - Fetch error
     */
     getBytes = (transaction) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await this.helix.getBytes(transaction);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    }
 }

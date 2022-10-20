import { env } from "../env";
import axios from "axios";


// // Get Info Transaction by Hash
// export const getInfoTransaction = async (txHash) => {
//     const url = `https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${env.API_ETHERSCAN}`;
//     try {
//         const response = await axios.get(url);
//         return {
//             success: true,
//             result: response.data
//         }
//     } catch (err) {
//         return {
//             success: false,
//             result: err.message
//         }
//     }
// }

// // Get tokenID by id in transaction info => info.id



// // Get info from a block Number
// export const getInfoBlockNumber = async(txHash) => {
//     let blockNumber;

//     const infoTransaction = await getInfoBlockNumber(txHash);
//     if (infoTransaction.success) {
//         blockNumber = infoTransaction.result.blockNumber;

//         const url = `https://api-goerli.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&&apikey=${env.API_ETHERSCAN}`;
//         try {
//             const response = await axios.get(url);
//             return {
//                 success: true,
//                 result: response.data.result
//             }
//         } catch (err) {
//             return {
//                 success: false,
//                 result: err.message
//             }
//         }
//     } else {
//         return {
//             success: false,
//             result: infoTransaction.result,
//         }
//     }
// }

// // Get info transaction receipt
// export const getTransactionReceipt = async(txHash) => {
//     const url = `https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${env.API_ETHERSCAN}`;
//     try {
//         const response = await axios.get(url);
//         return {
//             success: true,
//             result: response.data
//         }
//     } catch (err) {
//         return {
//             success: false,
//             result: err.message
//         }
//     }
// }

// Transaction Fee = (baseFeePerGas + maxPriorityFeePerGas) * gasUsed
// baseFeePerGas get from blockNumber info
// maxPriorityFeePerGas, gasUsed get from transaction info
export const getTransactionFee = async(txHash) => {
    try {
        const infoTransaction = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${env.API_ETHERSCAN}`)
            .then(result => result.data);
        
        const blockNumber = infoTransaction.result.blockNumber;

        const infoBlockNumber = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&&apikey=${env.API_ETHERSCAN}`)
            .then(result => result.data.result);

        const transactionReceipt = await axios.get(`https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${env.API_ETHERSCAN}`)
            .then(result => result.data);

            
        const baseFeePerGas = parseInt(infoBlockNumber.baseFeePerGas) / (10**8);
        const maxPriorityFeePerGas = parseInt(infoTransaction.result.maxPriorityFeePerGas) / (10 ** 8);
        const gasUsed = parseInt(transactionReceipt.result.gasUsed) / (10** 6);
        
        const transactionFee = (baseFeePerGas + maxPriorityFeePerGas) * gasUsed / (10**4);

        const getAllTransaction = await axios.get(`https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${env.CONTRACT_ADDRESS}&address=${env.ACCOUNT_ADDRESS}&page=1&offset=1000&startblock=0&endblock=99999999&sort=asc&apikey=${env.API_ETHERSCAN}`)
            .then(result => result.data.result)

        const tokenID = getAllTransaction[getAllTransaction.length - 1].tokenID + 1;

        return {
            success: true,
            result: `TokenID: ${tokenID},\n
            Transaction Hash: ${txHash},\n
            Transaction Fee: ${transactionFee} Ether
            `,
        }
    } catch (err) {
        return {
            success: false,
            result: 'Error in calculate transaction fee'
        }
    }
}
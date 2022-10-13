require("dotenv").config();
const ethers = require("ethers");

const API_KEY = "AXODOoFE9EUpK96e-jdHJgGIh3A5rtiM";
const PRIVATE_KEY = "ec7095193c3790752a871701e5095d28497cef5408caa0b555cd0454a88a9f11";

const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");

const provider = new ethers.providers.AlchemyProvider("goerli", API_KEY);
const signers = new ethers.Wallet(PRIVATE_KEY, provider);

const abi = contract.abi;
const contractAddress = "0xeaadaA7880BDB0F491f994A6A52D76e7B1D81127";

const myNFTContract = new ethers.Contract(contractAddress, abi, signers);

const tokenUri = "https://gateway.pinata.cloud/ipfs/QmXfw25G1foT771Ry1dc8sD51jgkQ3Jadhgw6sfgjKHr42/";

const mintNFT = async() => {
    let nftTxn = await myNFTContract.mintNFT(signers.address, tokenUri)
    await nftTxn.wait()
    console.log(`NFT Minted! Check it out at: https://goerli.etherscan.io/tx/${nftTxn.hash}`)
}

mintNFT()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error.message);
        process.exit(1);
    })
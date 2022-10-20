/* eslint-disable no-new-object */
import { env } from "../env";
import { getTransactionFee } from "./etherscan";
import { pinJSONtoIPFS } from "./pinata";

const {createAlchemyWeb3}  = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(env.ALCHEMY_KEY);
const ethers = require("ethers");

const contractJson = require("../MyNFT.json");
const abi = contractJson.abi;

const provider = new ethers.providers.AlchemyProvider("goerli", env.API_KEY);
const signers = new ethers.Wallet(env.PRIVATE_KEY, provider);

export const connectWallet = async() => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "Connect success, please fill all input above",
                address: addressArray[0],

            }
            return obj;
        } catch (error) {
            return {
                address: "",
                status: error.message,
            }
        }
    } else {
        return {
            address: "",
            status : (
                <>
                <span>
                    <p>
                        {"Please connect the Metamask Wallet"}
                        <a target="_blank" href="https://metamask.io/download/" rel="noreferrer"> 
                            You have to install Metamask on your browser
                        </a>
                    </p>
                </span>
                </>
            )
        }
    }
}

export const getCurrentAddressConnected = async() => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (addressArray.length > 0) {
            return {
              address: addressArray[0],
              status: "👆🏽 Write a message in the text-field above.",
            };
          } else {
            return {
              address: "",
              status: "🦊 Connect to Metamask using the top right button.",
            };
          }
        } catch (err) {
          return {
            address: "",
            status: "😥 " + err.message,
          };
        }
      } else {
        return {
          address: "",
          status: (
            <span>
                <a target="_blank" href={`https://metamask.io/download.html`} rel="noreferrer">
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
            </span>
          ),
        };
      }
}

export const getContractAddress = async() => {
    try{
      const factory = new ethers.ContractFactory(abi, contractJson.bytecode, signers);
      const contract = await factory.deploy({
        gasPrice:web3.utils.toWei('0.00000003', 'ether')
      })

      await contract.deployed();
      console.log(contract.address);
      return {
        success: true,
        status: contract.address,
      }
    } catch (error){
      return {
        success: false,
        status: error.message,
      }
    }
}

export const mintNFT = async(pathFile, name, description) => {  
  const metadata = new Object();
  metadata.name = name;
  metadata.image = pathFile
  metadata.description = description;

  const contractAddress = env.CONTRACT_ADDRESS;

  const myNFTContract = new ethers.Contract(contractAddress, abi, signers);

  const response = await pinJSONtoIPFS(metadata);
  let tokenURI;
  if (response.success) {
    tokenURI = response.pinataUrl;
  }

  try {
    const nftTxn = await myNFTContract.mintNFT(signers.address, tokenURI);
    await nftTxn.wait();
    return {
        success: true, 
        status: nftTxn.hash
    };
  } catch (error) {
    return {
      success: false,
      status: error.message
    }
  }
}

export const getResult = async(pathFile, name, description) => {
    const responseMint = await mintNFT(pathFile, name, description);

    if (responseMint.success) {
      try {
        const txHash = responseMint.status;
        const result = await getTransactionFee(txHash);

        return {
          success: true,
          status: result.result,
        }
      } catch (err) {
        return {
          success: false, 
          status: err.message,
        }
      }
    } else {
      return {
        success: false,
        status: responseMint.status
      }
    }
}
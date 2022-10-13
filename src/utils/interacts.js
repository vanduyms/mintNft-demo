import { env } from "../env";
import { pinFiletoIPFS, pinJSONtoIPFS } from "./pinata";
const ethers = require("ethers");

// const contractABI = require("../contract-abi.json");
// const contractABI = require("../NFT.json");

const contract = require("../MyNFT.json");

const provider = new ethers.providers.AlchemyProvider("goerli", env.API_KEY);
const signers = new ethers.Wallet(env.PRIVATE_KEY, provider);

const abi = contract.abi;
const contractAddress = "0xeaadaA7880BDB0F491f994A6A52D76e7B1D81127";

const myNFTContract = new ethers.Contract(contractAddress, abi, signers);

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
                        <a target="_blank" href="https://metamask.io/download/"> 
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
                <a target="_blank" href={`https://metamask.io/download.html`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
            </span>
          ),
        };
      }
}

// export const mint = async(signers, tokenURI) => {

// }

export const mintNFT = async(pathFile, name, description) => {
  const metadata = new Object();
  metadata.name = name;
  metadata.description = description;

  const responseImage = await pinFiletoIPFS(pathFile);
  let imgPath;
  if (responseImage.success) {
    imgPath = responseImage.pinataUrl;
  }

  metadata.image = imgPath;

  const response = await pinJSONtoIPFS(metadata);
  let tokenURI;
  if (response.success) {
    tokenURI = response.pinataUrl;
  }

  if (imgPath && tokenURI) {
    try {
    const nftTxn = await myNFTContract.mintNFT(signers.address, tokenURI)
    await nftTxn.wait()
    return {
        success: true, 
        status: `NFT Minted! Check it out at: https://goerli.etherscan.io/tx/${nftTxn.hash}`
    };
    } catch (error) {
      return {
        success: false,
        status: `Error: ${error.message}`
      }
    }
  } else {
    return {
      success: false,
      status: `Error: Cannot create metadata`
    }
  }
}
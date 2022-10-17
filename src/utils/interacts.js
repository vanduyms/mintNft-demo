/* eslint-disable no-new-object */
import { env } from "../env";
import { pinJSONtoIPFS } from "./pinata";

const {createAlchemyWeb3}  = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(env.ALCHEMY_KEY);

const contract = require("../MyNFT.json");
const abi = contract.abi;

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
      let contractAddress;
      window.contract = await new web3.eth.Contract(abi);
      await window.contract.deploy({data: contract.bytecode}).send({
        from: window.ethereum.selectedAddress,
        gasPrice:web3.utils.toWei('0.00003', 'ether')}
      ).then((contract) => contractAddress = contract._address)
      console.log(contractAddress);
      return {
        success: true,
        status: contractAddress,
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

  const responseContract = await getContractAddress();

  if (responseContract.success) {
    const contractAddress = responseContract.status;

    window.contract = await new web3.eth.Contract(abi, contractAddress);

    const response = await pinJSONtoIPFS(metadata);
    let tokenURI;
    if (response.success) {
      tokenURI = response.pinataUrl;
    }

    const transactionParameters = {
      to: contractAddress, 
      from: window.ethereum.selectedAddress, 
      
      gasLimit: 227431_000,
      data: window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI()
    };

    try {
      const txHash = await window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
      });

      return {
          success: true, 
          status: `NFT Minted! Check it out at: https://goerli.etherscan.io/tx/${txHash}`
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
      status: responseContract.status
    }
  }
}
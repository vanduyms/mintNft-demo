/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from 'react';
import { connectWallet, mintNFT, } from './utils/interacts';

function Minter(props) {
    const [walletAddress, setWalletAddress] = useState("");
    const [status, setStatus] = useState("");
    // const [url, setUrl] = useState("");
    const [name, setName ] = useState("");
    const [description, setDescription] = useState("");
    const [pathFile, setPathFile] = useState("");

    function addWalletListener() {
        if (window.ethereum) {
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setStatus("👆🏽 Write a message in the text-field above.");
            } else {
              setWalletAddress("");
              setStatus("🦊 Connect to Metamask using the top right button.");
            }
          });
        } else {
          setStatus(
            <p>
              {" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          );
        }
    }

  const onMintPressed = async() => {
    const {status} =  await mintNFT(pathFile, name, description);

    console.log(status);
    setStatus(status);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect( () => {
      // const {address, status} = getCurrentAddressConnected();
      // setWalletAddress(address);
      // setStatus(status);

      addWalletListener();
  }, []);

  const connectWalletFunc = async() => {
      const connectResponse = await connectWallet();
      setStatus(connectResponse.status);
      setWalletAddress(connectResponse.address);
  };

  const checkInput = () => {
    return name.length > 0 && pathFile.length > 0 && description.length > 0 && walletAddress.length > 0;
  }

  return (
    <div className='minter'>
        <button id='connectBtn' onClick={connectWalletFunc}>
            {
                walletAddress.length > 0 ? (
                    "Connected " + 
                    String(walletAddress).substring(0, 6) +
                    "..." +
                    String(walletAddress).substring(38)
                ) :
                <span>Connect Wallet</span>
            }
        </button>

        <br/>

        <h1 className='title'>Mint NFT</h1>
        <form>
            <h2>Link to assets: </h2>
            {/* <input 
                type="text"
                placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>" 
                onChange={e => setUrl(e.target.value)}
            /> */}
            <input 
              type="file"
              name="image"
              onChange={(e) => setPathFile(e.target.value)}
              accept='image/png, image/jpeg'
            />

            <h2>Name of NFT</h2>
            <input 
                type="text"
                placeholder='e.g. MyNFT'
                onChange={e => setName(e.target.value)}
            />
       
            <h2>Description</h2>
            <input 
                type="text"
                placeholder="e.g. Even cooler than cryptokitties"
                onChange={e =>setDescription(e.target.value)}
            />
        </form>
        <button 
          className={`${!checkInput() ? "disabled" : ""}`} 
          disabled={!checkInput()} 
          id='mintBtn' 
          onClick={onMintPressed}
            // onClick={() => console.log(pathFile)}
        >
            Mint NFT
        </button>

        <div id='status'>
            {status}
        </div>
    </div>
  )
}

export default Minter;
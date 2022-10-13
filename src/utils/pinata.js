import { env } from "../env";
import axios from "axios";
import { readFile } from "fs-web/dist/cjs/core";

const key = env.PINATA_KEY;
const secret = env.PINATA_SECRET_KEY;

const FormData = require('form-data');

export const pinFiletoIPFS = async(path) => {
  var data = new FormData();
  data.append('file', readFile(path));

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: { 
      pinata_api_key: key,
      pinata_secret_api_key: secret,
    },
    data : data
  };

  try {
    const res = await axios(config);
    return {
      success: true,
      pinataUrl: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    }
  } catch (err) {
    return {
      success: false,
    }
  }
}

export const pinJSONtoIPFS = async (data) => {
  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      pinata_api_key: key,
      pinata_secret_api_key: secret,
    },
    data : data
  };

  try {
    const res = await axios(config);
    return {
      success: true,
      pinataUrl: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    }
  } catch(err) {
    return {
      success: false,
    }
  }
}
/* Extra Deso functionality (Used in the sidebar component) */


import axios from "axios";

//const DEFAULT_NODE_URL = "https://node.deso.org/api"
const DEFAULT_NODE_URL =
  "https://ancient-reef-76919.herokuapp.com/https://node.deso.org/api";
let client = null;

class ExtraDeso {
  constructor() {
    this.client = null;
    this.baseUrl = DEFAULT_NODE_URL;
  }

  async getMessages(userkey){
    if (!userkey) {
      console.log("Key is required");
      return;
    }

    const path = "/v0/get-messages-stateless";
    const data = {
        "NumToFetch": 40,
        "PublicKeyBase58Check": userkey,
        "FetchAfterPublicKeyBase58Check": "",
        "HoldersOnly": false,
        "FollowersOnly": false,
        "FollowingOnly": false,
        "HoldingsOnly": false,
        "SortAlgorithm": "time"
      }
    try {
      const result = await this.getClient().post(path, data);
      
      return result.data;
    } catch (error) {
      return null;
    }
  }
 
  async getMessagesFor(userkey, user){
    if (!userkey) {
      console.log("Key is required");
      return;
    }

    const path = "/v0/get-messages-stateless";
    const data = {
        "NumToFetch": 25,
        "PublicKeyBase58Check": userkey,
        "FetchAfterPublicKeyBase58Check": "",
        "HoldersOnly": false,
        "FollowersOnly": false,
        "FollowingOnly": false,
        "HoldingsOnly": false,
        "SortAlgorithm": "time"
      }
    try {
      const result = await this.getClient().post(path, data);
      const chats = result.data.OrderedContactsWithMessages
      let results;
      chats.forEach(function(message){
        if(message.PublicKeyBase58Check == user){
            results = message.Messages
        }
       
      })
      results.forEach(function(message){
        alert("d")
        console.log(message.EncryptedText)
        
      })
      return results

    } catch (error) {
      return null;
    }
  }

  getClient() {
    if (client) return client;
    client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Content-Encoding": "gzip",
      },
    });
    return client;
  }
}

export default ExtraDeso;
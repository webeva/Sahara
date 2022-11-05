//Import the style for the chat
import style from "../../styles/Chat.module.css";
//Import the DeSo api
import DesoApi from "../api/Deso";
//Import from react 
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
//Import the emoji picker 
import Picker from "emoji-picker-react";
//Import the socket to send and receive messages in real time
import { useSocket } from "../../contexts/socketProvider";

export default function Chat() {
  //Intialize deso, socket and next router
  const deso = new DesoApi();
  const socket = useSocket();
  const router = useRouter();
  //Set up some variables 
  const [username, setUsername] = useState("Loading..."); //Used to store the username of the current person you are chatting to.
  const [messages, setMessages] = useState(); //Used to store the messages
  const [emojiState, setEmojiState] = useState(false); //Used to store the emoji state ie hidden or showing
  const [image, setImage] = useState(null); //Used to store the image to be sent 
  //Used to store the image 
  const inputFile = useRef(null);
  //Runs whenever we switch between communities
  useEffect(() => {
    //Work in progress (Check if the user has access to this chat)
    getAccess(localStorage.getItem("deso_user_key"), router.query.id);
    //Get the username of the community
    setUsername(router.query.id);
    //get the messages for the community (Work in progress)
    getMessages(router.query);
  }, [router.query]);

  //Work in progress (Check if the user has access to a chat)
  async function getAccess(user, id) {
    const response = await deso.getNFTForUser(user, id);
  }
  //Get the messages for a community (Work in progress)
  async function getMessages(userkey) {
    const user = localStorage.getItem("deso_user_key");

    const messages = [];
    const key = await deso.getPublicKey(userkey);
    //Get the messages
    const response = await deso.getMessages(
      "BC1YLgiijoLazmMdkYCVCvH2JMeRVaLsFwmU7DTR747Ut8jXMVj14aA",
      key
    );
    /* Loop through every message to find the ones we need. Not 
    very efficent but at the moment it is the only the messaging 
    api works */

    response.forEach(function (message) {
      /*If the sender publickey is equal to the current person's public key 
      then add it to the array of messages */
      if (message.PublicKey == key) {
        const DMessage = message.DecryptedMessage; //The message
        let Sender; //Sender 
        let Image; //Image if there is one

        //If you are the sender the public key of the sender is just you
        if (message.IsSender == true) {
          Sender = localStorage.getItem("deso_user_key");
        } else {
          Sender = message.PublicKey;
        }
        //If there is an image set it as so.
        if (message.ExtraData?.Img) {
          Image = message.ExtraData.Img;
        } else {
          Image = null;
        }
        //Push the message object into an array.
        messages.push({ Message: DMessage, Sender: Sender, Image: Image });
      }
    });
    //Set messages to the array we just created
    setMessages(messages);
  }
  //Function that will add the selected emoji to the message field value.
  function addEmoji(event) {
    document.getElementById("MessageField").value += event.emoji;
  }

  //Set up the connection with the socket.
  useEffect(() => {
    if (socket === undefined) return;
    /* Whenever we receive a message, go through the getmessages
    function again */
    socket.on("receive-message", (sender, Recepient, message) => {
      getMessages(router.query);
    });
  }, [socket]);

  //Whenever the messages change make sure to scroll to the bottom of the chat box
  useEffect(() => {
    var chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  //On image button click, click on the input field.
  const onImageClick = () => {
    inputFile.current.click();
  };

  const changeHandler = (event) => {
    //Get the selected image
    const img = event.target.files[0];
    getImageUrl(img);
  };
  //Upload the image to DeSo and get the image link
  async function getImageUrl(result) {
    const user = localStorage.getItem("deso_user_key");
    const JWT = await deso.getJwt(user);
    const link = await deso.uploadImage(user, JWT, result);
    setImage(link.ImageURL);
  }
  //Function that will send the message whenever the enter key is pressed
  async function handleKeyPress(event) {
    //Check if the key pressed was the enter key
    if (event.key === "Enter") {
      //Send a message
      if (document.getElementById("MessageField").value) {
        //Send the message to DeSo
        const response = await deso
          .sendMessage(
            localStorage.getItem("deso_user_key"),
            router.query.id,
            document.getElementById("MessageField").value,
            image
          )
          .then(() => {
            //Get the messages
            const user = localStorage.getItem("deso_user_key");
            const message = document.getElementById("MessageField").value;
            const receiver = router.query.id;
            getMessages(router.query);

            
            //Emit the send-message to socket.io
            socket.emit("send-message", { user, receiver, message });
            //Clear the input field
            document.getElementById("MessageField").value = "";
            //Clear the image 
            setImage(null);
          });
      }
    }
  }
  //Return the JSX
  return (
    <div className={style.body}>
      <div className={style.header}>
        <h1>@{username}</h1>
        <p>Community</p>
      </div>
      <div>
        <ul className={style.chatList} id="chatBox">
          {messages?.map(function (mes) {
            {/* Loop through every message */}
            return (
              <li>
                <img
                  className={style.profile}
                  src={`https://diamondapp.com/api/v0/get-single-profile-picture/${mes.Sender}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                  alt="Profile Picture"
                ></img>
                <p>{mes.Message}</p>
                {mes.Image ? (
                  <div>
                    <img className={style.image} src={mes.Image} alt="Image" />
                  </div>
                ) : (
                  <div></div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <input
        alt="uploadImage"
        type="file"
        accept="image/*"
        name="file"
        ref={inputFile}
        onChange={changeHandler}
        style={{ display: "none" }}
      />

      {image ? (
        <div className={style.uploadBox}>
          <div className={style.removeImage} onClick={() => setImage(null)}>
            x
          </div>
          <img className={style.uploadImage} src={image} alt="Uploaded image" />
        </div>
      ) : (
        <></>
      )}

      <div className={style.bar}>
        <img
          src="/assets/Emoji.svg"
          alt="Emoji"
          onClick={() => setEmojiState(!emojiState)}
        />
        <input
          id="MessageField"
          type="text"
          onKeyDown={handleKeyPress}
          placeholder="Click here to start typing"
        />
        <img src="/assets/Image.svg" alt="Image" onClick={onImageClick} />
      </div>
      <div
        className={style.emoji}
        style={{ display: emojiState ? "block" : "none" }}
      >
        <Picker onEmojiClick={(e) => addEmoji(e)} />
      </div>
    </div>
  );
}

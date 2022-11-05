/* The chat page */

//Import the style for the chat
import style from "../../styles/Chat.module.css";
//Import the DeSo api
import DesoApi from "../api/Deso";
//Import from react
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
//Import useSocket to send and receive messages in real-time
import { useSocket } from "../../contexts/socketProvider";
//Import the emoji picker 
import Picker from "emoji-picker-react";

//Export the chat page
export default function Chat() {
  //Intialize Deso, Socket.io and the router
  const deso = new DesoApi();
  const socket = useSocket();
  const router = useRouter();
  //Variables used to store information 
  const [username, setUsername] = useState("Loading..."); //The current username of the person you are chatting to
  const [key, setKey] = useState(); //The public key of the current person you are chatting to.
  const [messages, setMessages] = useState(); //The messages of the chat with the person you are talking to.
  const [emojiState, setEmojiState] = useState(false); //The emoji state ie hidden or showing 
  const [image, setImage] = useState(null); //The image you want to send
  //Used to store the image you want to send
  const inputFile = useRef(null);

  //Runs on load
  useEffect(() => {
    
    setMessages();
    //Get the the username of the person you are chatting to
    getUsername(router.query);
    //Get the messages with that chat
    getMessages(router.query);
    setKey(router.query.id);

  }, [router.query]);

  //Function to get the username based on the public key
  async function getUsername(userkey) {
    setUsername(await deso.getUsername(userkey.id));
  }
  //Get the user's messages in that chat
  async function getMessages(userkey) {
    const user = localStorage.getItem("deso_user_key");
    const response = await deso.getMessages(user);
    const messages = [];
    /* Loop through every message and get the ones we need. 
    Highly inefficent but can be fixed later */

    response.forEach(function (message) {
      //If the public key of the chat matches with the one you are currently in 
      if (message.PublicKey == userkey.id) {

        const DMessage = message.DecryptedMessage; //The message sent
        let Sender; //The sender 
        let Image; //The image sent 

        /* If you sent the message set the sender's key 
        to your key. Else set it to the other user's key */

        if (message.IsSender == true) {
          Sender = localStorage.getItem("deso_user_key");
        } else {
          Sender = message.PublicKey;
        }

        //If there is a message set it to show
        if (message.ExtraData?.Img) {
          Image = message.ExtraData.Img;
        } else {
          Image = null;
        }
        //Push the object into the messages array
        messages.push({ Message: DMessage, Sender: Sender, Image: Image });
      }
    });
    //Set messages to that array we created
    setMessages(messages);
  }

  /* Function to send a message once the enter key 
  has been pressed */

  async function handleKeyPress(event) {
    //Check if the key pressed is the enter key.
    if (event.key === "Enter") {
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
            const user =
              "BC1YLgiijoLazmMdkYCVCvH2JMeRVaLsFwmU7DTR747Ut8jXMVj14aA";
            const message = document.getElementById("MessageField").value;
            const receiver = router.query.id;
            getMessages(router.query);

            
            //Emit the send-message signal to socket.io
            socket.emit("send-message", { user, receiver, message });
            //Clear the input field
            document.getElementById("MessageField").value = "";
            //Clear the image
            setImage(null);
          });
      }
    }
  }

  /* Whenever we receive a message from socket run this */
  useEffect(() => {
    if (socket === undefined) return;
    //If the message is receive message then get the messages
    socket.on("receive-message", (sender, Recepient, message) => {
      getMessages(router.query);
    });
  }, [socket]);

  //Whenever the messages change make sure that we scroll to the bottom.
  useEffect(() => {
    var chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  //Function that will add the currently selected emoji to the text field.
  function addEmoji(event) {
    document.getElementById("MessageField").value += event.emoji;
  }
  //On image button click, click on the input field.
  const onImageClick = () => {
    inputFile.current.click();
  };

  const changeHandler = (event) => {
    //Get the selected image
    const img = event.target.files[0];
    getImageUrl(img);
  };
  //Upload the image to DeSo and get the url back
  async function getImageUrl(result) {
    const user = localStorage.getItem("deso_user_key");
    const JWT = await deso.getJwt(user);
    const link = await deso.uploadImage(user, JWT, result);
    setImage(link.ImageURL);
  }
  //Return the JSX
  return (
    <div className={style.body}>
      <div className={style.header}>
        <h1>@{username}</h1>
        <p>{key}</p>
      </div>
      <div>
        <ul className={style.chatList} id="chatBox">
          {messages?.map(function (mes) {
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

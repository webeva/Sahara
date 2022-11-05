/* The sidebar component */

//Import the style
import style from "./Sidebar.module.css";
//Import the Extra Deso api
import ExtraDeso from "../../pages/api/ExtraDeso";
//Import from react
import { useEffect, useState } from "react";
//Import the profile picture
import ProfilePicture from "../ProfilePic";
//Import the link from next
import Link from "next/link";

//Export the sidebar component
export default function Sidebar() {
  //Intialize extra deso
  const Extradeso = new ExtraDeso();
  //Used to store all of the user's chats
  const [ChatData, setChatData] = useState("");

  useEffect(() => {
    getMessages();
  }, []);

  //Function used to get the user's contacts and chats
  async function getMessages() {
    const user = localStorage.getItem("deso_user_key");
    if (user) {
      const response = await Extradeso.getMessages(user);
      //Set chat data to the user's chats
      setChatData(response.OrderedContactsWithMessages);
    }
  }
  //Return the JSX
  return (
    <div className={style.chatMenu}>
      <ul className={style.chat}>
        <div className={style.search}>
          <input type="text" placeholder="Search up a user" />
        </div>
        {ChatData.length > 0 ? (
          ChatData?.map(function (value) {
            return (
              <Link
                href={`/u/${value.ProfileEntryResponse.PublicKeyBase58Check}`}
              >
                <li>
                  <div className={style.chatContain}>
                    <ProfilePicture
                      userkey={value.ProfileEntryResponse.PublicKeyBase58Check}
                      width={40}
                      username={value.ProfileEntryResponse.Username}
                    />
                    <p>{value.ProfileEntryResponse.Username}</p>
                  </div>
                </li>
              </Link>
            );
          })
        ) : (
          
          <>
          {/* Loading */}
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </>
        )}
      </ul>
      <div className={style.header}>
        <h1 className={style.headerText}>Chats</h1>
      </div>
    </div>
  );
}

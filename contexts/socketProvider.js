/* Socket provider used for the client side */

//Import from react
import React, { useContext, useEffect, useState } from "react";
//Import the socket.io client version
import io from "socket.io-client";
//Create a new contect
const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const user = localStorage.getItem("deso_user_key");
    //Set up a new client with localhost:5000
    const newSocket = io("http://localhost:5000", { query: { user } });
    setSocket(newSocket);
    return () => newSocket.close();
  }, [id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

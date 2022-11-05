
/* This is the body of the website. */

//Import the  global styles file 
import "../styles/globals.css";
//Import the components we will be needing.
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Rightbar from "../components/Rightbar";
//Import from react and next 
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
//Import the DesoApI to allow for logging in.
import DesoApi from "./api/Deso";
//Import the socket provider to wrap around the entire app
import { SocketProvider } from "../contexts/socketProvider";

function MyApp({ Component, pageProps }) {
  //Intialize the deso api
  const deso = new DesoApi();
  //Set the intial app state to loading to show the loading screen
  const [user, setUser] = useState("loading");
  //Intialize next js router
  const router = useRouter();
  /* Function that allows to login at whatever 
  level required */
  async function requestLogin(level) {
    //Bring out the login prompt 
    const response = await deso.login(level).then(() => {
      const user = localStorage.getItem("deso_user_key");
      //Check if they actually logged in or not 
      if (user) {
        //They logged in send them to the main page
        setUser(true);
        //Route to the main page
        router.push("/");
      } else {
        //They did not login 
        setUser(false);
      }
    });
  }
  /* When they first arrive on the site check if 
  they are logged in or not. If so reroute them to 
  the main page */

  useEffect(() => {
    const user = localStorage.getItem("deso_user_key");
    //Small delay to allow for the loading screen to load
    setTimeout(() => {
      if (user) {
        //The user is logged in send them to the main page 
        setUser(true); 
        if (router.asPath == "/") {
          router.push("/");
        }
      } else {
        //The user is not logged in send them to the home page.
        setUser(false); 
        router.push("/home");
      }
    }, 1000);
  }, []);

  //Check if the user logged in or out in between routes
  useEffect(() => {
    const user = localStorage.getItem("deso_user_key");
    if (user) {
      setUser(true);
    } else {
      setUser(false);
    }
  }, [router]);

  //Return the JSX
  return (
    <>
      {/* Check if the app state is currently loading */}
      {user == "loading" ? (
        <div className="loading">Loading NFT Communities...</div>
      ) : (
        <>
          {/* The page is not loading so check if the 
          user is logged in. If so, display the navbar, 
          sidebar, componenets in the middle and the 
          rightbar. Or else load the home screen.*/}
          {user ? (
            <SocketProvider id={user}>
              <Navbar />
              <Sidebar />
              <Component {...pageProps} />
              <Rightbar />
            </SocketProvider>
          ) : (
            <div>
              {/* Home screen design  */}
              <section className="hero">
                <header className="header container">
                  <nav className="nav">
                    <img
                      className="logo"
                      src="./assets/logo.png"
                      alt="logo"
                    ></img>
                    <ul className="navList">
                      <li className="navItem">
                        <a
                          href="#"
                          onClick={() => requestLogin(2)}
                          className="navButton"
                        >
                          Connect
                        </a>
                      </li>
                    </ul>
                  </nav>
                </header>
                <Component {...pageProps} />
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
//Export the app
export default MyApp;

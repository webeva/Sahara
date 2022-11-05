/* Home page used when a user is not logged in */

//Import the style
import style from "../styles/Home.module.css";

export default function Home() {
  /* In the home screen there is a simple typing animation. 
  This array contains all of the messages that will be typed
  out */

  const texts = ["Encrypted Messages", "Decentralized Chat", "NFT Communities"];
  let i = 0;
  
  //Loop through every text in the array. 
  setInterval(() => {
    //Set the current text to texts[i]
    document.getElementById("textContent").innerText = texts[i];
    //If i is greater than the length of the array set it to 0.
    if (i > texts.length - 1) {
      document.getElementById("textContent").innerText = texts[0];
      i = 0;
    } else {
      i += 1;
    }
  }, 4000);

  //Return the JSX
  return (
    <>
      <div className={style.main}>
        <div className={style.left}>
          <h1 className={style.static}>Sahara</h1>
          <ul className={style.dynamic}>
            <li>
              <span id="textContent">NFT Communities</span>
            </li>
          </ul>
        </div>
        <div className={style.right}>
          <img
            className={style.rightImage}
            src="https://images.deso.org/bda8fa59eef35225bf80a6e152314afb46e0d4c2f69623129937afd2d4d11592.webp"
          ></img>
        </div>
      </div>
    </>
  );
}

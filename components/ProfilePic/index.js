/* Reusable profile picture element */

//Import Link from next link
import Link from "next/link";

//Export the profile picture
export default function ProfilePicture({ userkey, width, username }) {
  //Return the JSX
  return (
    <Link href={`https:evasocial.app/profile/${username}`}> {/* Route to their profile */}
      <img
        style={{
          width: { width },
          height: { width },
          borderRadius: "50%",
          flex: "none",
          order: 0,
          flexGrow: 0,
        }}
        src={`https://diamondapp.com/api/v0/get-single-profile-picture/${userkey}`}
        alt="Profile"
      />
    </Link>
  );
}

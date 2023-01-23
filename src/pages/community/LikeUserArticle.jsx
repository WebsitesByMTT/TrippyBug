// import React, { useState, useEffect } from "react";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth, db } from "../../../firebase";
// import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
// import { AiFillLike, AiOutlineConsoleSql } from "react-icons/ai";

// export default function LikeUserArticle({ articleId, likes }) {
//   const [user] = useAuthState(auth);
//   const [userUid, setUserUid] = useState();
//   useEffect(() => {
//     setUserUid(user.uid);
//   });
//   const likesRef = doc(db, "Articles", articleId);
//   console.log(userUid);
//   // updating data in already existing data in firebase DB

//   const handleLike = () => {
//     if (likes?.includes(userUid)) {
//       updateDoc(likesRef, {
//         likes: arrayRemove(userUid),
//       })
//         .then(() => {
//           console.log("unliked");
//         })
//         .catch((e) => {
//           console.log(e);
//         });
//     } else {
//       updateDoc(likesRef, {
//         likes: arrayUnion(userUid),
//       })
//         .then(() => {
//           console.log(articleId);
//           console.log("liked");
//         })
//         .catch((e) => {
//           console.log(e);
//         });
//     }
//   };
//   return (
//     <div>
//       <button
//         onClick={handleLike}
//         className={`fa fa-heart${!likes?.includes(userUid) ? "-o" : ""} fa-lg`}
//         style={{
//           cursor: "pointer",
//           color: likes?.includes(userUid) ? "red" : null,
//         }}
//       >
//         <AiFillLike className="h-[25px] w-[25px] " />
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";

import { AiFillLike, AiOutlineConsoleSql } from "react-icons/ai";
const LikeUserArticle = ({ articleId }) => {
  const [user] = useAuthState(auth);
  const [likeRef, setLikeRef] = useState();
  useEffect(() => {
    const getLikeRef = () => {
      const likesRef = doc(db, "Articles", articleId);
      setLikeRef(likesRef);
    };
    getLikeRef();
  }, [articleId]);

  const handleClicked = () => {
    updateDoc(likeRef, {
      likes: arrayUnion(user.uid),
    })
      .then(() => {
        console.log("liked");
        console.log(likeRef);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  console.log(likeRef);
  return (
    <div>
      <button onClick={handleClicked}>Like</button>
    </div>
  );
};

export default LikeUserArticle;

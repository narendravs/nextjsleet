"use client";
import React, { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  where,
  query,
  setDoc,
} from "firebase/firestore";
import { DBProblem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";
import { Snapshot } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { problems } from "@/mockProblems/problems";
const Display = () => {
  // const [problems, setProblems] = useState<DBProblem[]>([]);
  // const [user] = useAuthState(auth);
  const id = "jump-game";

  const display = async () => {
    // const q = query(collection(firestore, "problems"), where("id", "==", id));
    // const querySnapshot = await getDocs(q);
    // querySnapshot.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log(doc.id, " => ", doc.data());
    // });
    // const uid = "TdYoFlmrZHZ2LxPNyCfnQzuvuhb2";
    // const userRef = doc(firestore, "users", "TdYoFlmrZHZ2LxPNyCfnQzuvuhb2");
    // const userSnap = await getDoc(userRef);
    // // if (userSnap.exists()) {
    // const data = userSnap.data();
    // // const { solvedProblems, likedProblems, dislikedProblems, starredProblems } =     data;
    // console.log("data", data);
    // }
    // const userData = {
    //   uid: "soISqYnOFWUxLAKANIUCtYLrc9n1",
    //   email: "test@gmail.com",
    //   displayName: "test",
    //   createdAt: Date.now(),
    //   updatedAt: Date.now(),
    //   likedProblems: [],
    //   dislikedProblems: [],
    //   solvedProblems: [],
    //   starredProblems: [],
    // };
    // console.log(userData);
    // await setDoc(
    //   doc(firestore, "users", "soISqYnOFWUxLAKANIUCtYLrc9n1"),
    //   userData
    // );
    problems.map(async (data, id) => {
      alert(data.id);
      const probRef = collection(firestore, "problems");
      await setDoc(doc(probRef, data.id), data);
    });

    // const probRef = doc(firestore, "problems", "n7GOiBPKICX2GVWvIh6S");
    // const probDoc = await getDoc(probRef);
    // alert(probDoc.exists());
  };

  useEffect(() => {
    console.log("hello");
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-screen top-0 left-0">
      <button className="bg-gray-500 p-1 px-2 rounded-lg" onClick={display}>
        submit
      </button>
    </div>
  );
};

export default Display;

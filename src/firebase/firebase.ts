import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu4GeejUE0R4uxeyFGZf4IIje5gNa0icM",
  authDomain: "leetcode-af8ed.firebaseapp.com",
  projectId: "leetcode-af8ed",
  storageBucket: "leetcode-af8ed.appspot.com",
  messagingSenderId: "811676328416",
  appId: "1:811676328416:web:c40eb4302ab25c67534b85",
  measurementId: "G-TCSEM56PBY",
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const firestore = getFirestore(app);

export { app, auth, firestore };

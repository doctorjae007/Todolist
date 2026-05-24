import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBONy9D7yNvhXOz1nJurEqX19RruiGq7qU",
  authDomain: "todolist-2e43c.firebaseapp.com",
  projectId: "todolist-2e43c",
  storageBucket: "todolist-2e43c.firebasestorage.app",
  messagingSenderId: "703158901297",
  appId: "1:703158901297:web:cb9348dde0d7294211d310",
  measurementId: "G-V7Z5GF9J9B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
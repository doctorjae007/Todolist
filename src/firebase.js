import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = [
  "VITE_API_KEY",
  "VITE_AUTH_DOMAIN",
  "VITE_PROJECT_ID",
  "VITE_STORAGE_BUCKET",
  "VITE_MESSAGING_SENDER_ID",
  "VITE_APP_ID",
];

const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase env vars: ${missing.join(", ")}. ` +
    "Check your .env file."
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
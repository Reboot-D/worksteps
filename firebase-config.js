// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCj7Xp5xY4K3-S8Q6SSSvcN6SFIrMCGXeI",
  authDomain: "nonfinancial-aml.firebaseapp.com",
  projectId: "nonfinancial-aml",
  storageBucket: "nonfinancial-aml.firebasestore.app",
  messagingSenderId: "984777892586",
  appId: "1:984777892586:web:1f8ae2cf058b8f0997ad93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; 
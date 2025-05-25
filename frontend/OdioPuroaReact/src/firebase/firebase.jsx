import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_O2n8joFWoJmxwtAoE4BG5hs1dmTJcf4",
  authDomain: "proyectondas-4fc25.firebaseapp.com",
  projectId: "proyectondas-4fc25",
  storageBucket: "proyectondas-4fc25.firebasestorage.app",
  messagingSenderId: "515657564559",
  appId: "1:515657564559:web:1f45e85d0774412c5dcbfa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

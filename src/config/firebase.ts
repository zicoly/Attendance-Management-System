import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDW4a3JluLz4jDRZ6PaX5MXcXf5X7lNkjc",
  authDomain: "attendance-app-1b0ab.firebaseapp.com",
  projectId: "attendance-app-1b0ab",
  storageBucket: "attendance-app-1b0ab.firebasestorage.app",
  messagingSenderId: "296360888739",
  appId: "1:296360888739:web:efbf0f5f03dabc575c7216",
  measurementId: "G-X1YX8Z7341",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();

export default app;

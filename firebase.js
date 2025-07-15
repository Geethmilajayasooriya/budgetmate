// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcDeCacWePRdl3dYeJy7NsS_JCDKx11Fs",
  authDomain: "loginsignup-25f19.firebaseapp.com",
  projectId: "loginsignup-25f19",
  storageBucket: "loginsignup-25f19.firebasestorage.app",
  messagingSenderId: "990041544732",
  appId: "1:990041544732:web:593028d20756f7c97127d9",
  measurementId: "G-8P5PPSZG7B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

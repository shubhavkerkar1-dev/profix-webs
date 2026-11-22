// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQqJlvrRLmHolYAHr1WrhfMi2GcVMIUyY",
  authDomain: "profix-991ea.firebaseapp.com",
  projectId: "profix-991ea",
  storageBucket: "profix-991ea.firebasestorage.app",
  messagingSenderId: "543186236073",
  appId: "1:543186236073:web:8e49e8911b914805d4efb8",
  measurementId: "G-1EG879FZDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
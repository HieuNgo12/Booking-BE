// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0K2bRvzIfkZPvLxfARm7gJXS_aF47YP0",
  authDomain: "testproject-edac9.firebaseapp.com",
  projectId: "testproject-edac9",
  storageBucket: "testproject-edac9.firebasestorage.app",
  messagingSenderId: "1031104764261",
  appId: "1:1031104764261:web:2deefbd513963cb318e98c",
  measurementId: "G-N9R0H4230N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { analytics, auth };

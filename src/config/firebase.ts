import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyDZ_7OLVZWZBaJU7AlRwh6SniIWbKxuQlU",
  authDomain: "web-m2-app.firebaseapp.com",
  projectId: "web-m2-app",
  storageBucket: "web-m2-app.appspot.com",
  messagingSenderId: "29097942681",
  appId: "1:29097942681:web:5de8b61add9d7147642208",
  measurementId: "G-Y0KP9BQK24"
};


export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app) 
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBAfwdb2E-DiGDVUH3Xwe3xR22bjdhOnzY",
  authDomain: "teduglo.firebaseapp.com",
  projectId: "teduglo",
  storageBucket: "teduglo.appspot.com",
  messagingSenderId: "307913430099",
  appId: "1:307913430099:web:7ec270262dbbe1e5a1a2a6",
  measurementId: "G-953HDH71VD",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"; // 記得加上 getApps
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdB4UfPm5j5SzTmQ3QHLUU43-3imdEu1I",
  authDomain: "textcube-82cfe.firebaseapp.com",
  projectId: "textcube-82cfe",
  storageBucket: "textcube-82cfe.firebasestorage.app",
  messagingSenderId: "260343812965",
  appId: "1:260343812965:web:4264e22a5216d617c0078c",
  measurementId: "G-DS55RVZBY8"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  // 如果沒有 App，就初始化新的
  app = initializeApp(firebaseConfig);
} else {
  // 如果已經有了，就直接拿現有的 App
  app = getApps()[0];
}
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, db, auth };
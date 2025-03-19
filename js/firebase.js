// Импортируем нужные модули из Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ТВОЙ КОНФИГ ИЗ FIREBASE КОНСОЛИ
const firebaseConfig = {
  apiKey: "AIzaSyAnNHmXmoWK8sDW-vxK8sD9Xyzdse5sEFA",
  authDomain: "handcrafted-af31d.firebaseapp.com",
  databaseURL: "https://handcrafted-af31d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "handcrafted-af31d",
  storageBucket: "handcrafted-af31d.appspot.com",
  messagingSenderId: "367645879736",
  appId: "1:367645879736:web:471ec5d228b66ebdb1734d",
  measurementId: "G-TGMV1KDP1F"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем сервисы для использования в проекте
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

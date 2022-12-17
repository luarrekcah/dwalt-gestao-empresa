const { initializeApp } = require("@firebase/app");
const {getStorage} = require("@firebase/storage")
  require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId ,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

try {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  console.log('[LOG] Conectado ao banco de dados')
} catch (error) {
  console.error(error);
}
const {
  getDatabase,
  ref,
  push,
  update,
  remove,
  get,
  set,
} = require("@firebase/database");
const { ref: storRef, getStorage, uploadString, getDownloadURL } = require("@firebase/storage");
const moment = require("../services/moment");
require("../database");

module.exports = {
  createItem: async ({ path, params }) => {
    const db = getDatabase();
    if (!path) return { error: "Sem path" };
    if (path.includes("undefined")) {
      console.log(path);
      return console.warn("Erro, undefined!");
    }
    
    try {
      const newItemRef = push(ref(db, path), params);
      const newItemKey = newItemRef.key;
  
      console.log("[LOG] Gravação no banco de dados");
      
      return newItemKey;
    } catch (error) {
      console.warn(error);
      return { error: "Erro ao criar o item no banco de dados" };
    }
  },
  updateItem: ({ path, params }) => {
    const db = getDatabase();
    if (!path) return { error: "Sem path" };
    if (path.includes("undefined")) {
      console.log(path);
      return console.warn("Erro, undefined!");
    }
    try {
      update(ref(db, path), params)
        .then(console.log("[LOG] Atualização no banco de dados"))
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.warn(error);
    }
  },
  deleteItem: ({ path }) => {
    const db = getDatabase();
    if (!path) return { error: "Sem path" };
    if (path.includes("undefined")) {
      console.log(path);
      return console.warn("Erro, undefined!");
    }
    try {
      remove(ref(db, path))
        .then(console.log("[LOG] Remoção no banco de dados"))
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.warn(error);
    }
  },
  getAllItems: async ({ path }) => {
    const db = getDatabase();
    if (!path) return { error: "Sem path" };
    if (path.includes("undefined")) {
      console.log(path);
      return console.warn("Erro, undefined!");
    }
    const snapshot = await get(ref(db, path));
    let alldata = [];
    snapshot.forEach((childSnapshot) => {
      let key = childSnapshot.key,
        data = childSnapshot.val();
      alldata.push({ key, data });
    });
    return alldata;
  },
  getItems: async ({ path }) => {
    const db = getDatabase();
    if (!path) return { error: "Sem path" };
    if (path.includes("undefined")) {
      console.log(path);
      return console.warn("Erro, undefined!");
    }
    const snapshot = await get(ref(db, path));
    return snapshot.val() || [];
  },
  getUser: async ({ userId }) => {
    const db = getDatabase();
    if (!userId) return { error: "Sem id" };
    const snapshot = await get(
      ref(db, `gestaoempresa/business/${userId}/info`)
    );
    const data = snapshot.val();
    return { key: userId, data };
  },
  createLogs: (userId, message) => {
    if (process.env.DEV) {
      message += " [DEV]";
    }
    const db = getDatabase();
    try {
      push(ref(db, `gestaoempresa/business/${userId}/logs`), {
        message,
        createdAt: moment().format(),
      })
        .then(console.log("[LOG] Gravação LOGS no banco de dados"))
        .catch((error) => {
          console.warn(error);
        });
    } catch (error) {
      console.warn(error);
    }
  },
  uploadFile: ({ path, base64 }) => {
    const storage = getStorage();
    const storageRef = storRef(storage, path);
    const url = uploadString(storageRef, base64, "data_url").then(
      (snapshot) => {
        return getDownloadURL(snapshot.ref).then((downloadURL) => {
          return downloadURL;
        });
      }
    );
    return url;
  },
};

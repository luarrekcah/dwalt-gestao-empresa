const { initializeApp } = require("@firebase/app");
const { getStorage } = require("@firebase/storage");
const { getAllItems, updateItem, deleteItem, createItem } = require("./database/users");
require('dotenv').config();


const { ref, uploadString, getDownloadURL } = require("@firebase/storage");
const { getDate } = require("./auth/functions/database");

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
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

/*
*
*/
/*
const manutencao = async () => {

  console.log("código de manutenção")

  const storage = getStorage();

  const empresas = await getAllItems({ path: `gestaoempresa/business` });

  empresas.forEach(async e => {
    const projetos = await getAllItems({ path: `gestaoempresa/business/${e.key}/projects` });

    projetos.forEach(async p => {
      const docs = await getAllItems({ path: `gestaoempresa/business/${e.key}/projects/${p.key}/documents` });
      docs.forEach(d => {
        if (d.data.documentBase64) {
          const storageRef = ref(storage, `gestaoempresa/business/${e.key}/projects/${p.key}/documents/${d.data.documentName}.pdf`);
          uploadString(storageRef, d.data.documentBase64, 'data_url').then((snapshot) => {
            console.log(snapshot);
            getDownloadURL(snapshot.ref).then((downloadURL) => {
              updateItem({
                path: `gestaoempresa/business/${e.key}/projects/${p.key}/documents/${d.key}`,
                params: {
                  documentName: d.data.documentName,
                  documentURL: downloadURL,
                  createdAt: getDate()
                }
              });
              deleteItem({ path: `gestaoempresa/business/${e.key}/projects/${p.key}/documents/${d.key}/documentBase64` })
              console.log(`Atualizando projeto ${p.data.apelidoProjeto}`)
            });
          });
        }
      })
    })
  });
}

manutencao();
*/
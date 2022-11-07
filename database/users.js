const { getDatabase, set, ref, push, query, equalTo, update, remove, onValue, child, Database, get } = require('@firebase/database');

require('../database');

module.exports = {
    createItem: ({ path, params }) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        push(ref(db, path), params).then(
            console.log("[LOG] Gravação no banco de dados")
        ).catch((error) => {
            console.warn(error);
        });
    },
    updateItem: ({ path, params }) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        update(ref(db, path),
            params
        ).then(
            console.log("[LOG] Atualização no banco de dados")
        ).catch((error) => {
            console.log(error);
        });
    },
    deleteItem: ({ path }) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        remove(ref(db, path))
            .then(
                console.log("[LOG] Remoção no banco de dados")
            ).catch((error) => {
                console.log(error);
            });
    },
    getAllItems: async ({ path }) => {
         const db = getDatabase();
         if (!path) return { error: 'Sem path' }
         const snapshot = await get(ref(db, path))
         let alldata = [];
         snapshot.forEach(childSnapshot => {
             let key = childSnapshot.key,
                 data = childSnapshot.val();
             alldata.push({ key, data })
         });
         return alldata;
    },
    getItems: async ({path}) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        const snapshot = await get(ref(db, path))
        return snapshot.val();
    },
    getUser: async ({userId}) => {
        const db = getDatabase();
        if (!userId) return { error: 'Sem id' }
        const snapshot = await get(ref(db, `gestaoempresa/business/${userId}/info`))
        const data = snapshot.val()
        return {key: userId, data}
    }
}
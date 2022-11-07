const { getDatabase, set, ref, push, query, equalTo, update, remove, onValue, child, Database, get } = require('@firebase/database');

require('../database');

module.exports = {
    createItem: ({ path, params }) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        push(ref(db, path), params).then(
            console.log("[GRAVAÇÃO].")
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
            console.log("[ATUALIZAÇÃO].")
        ).catch((error) => {
            console.log(error);
        });
    },
    deleteItem: ({ path }) => {
        const db = getDatabase();
        if (!path) return { error: 'Sem path' }
        remove(ref(db, path))
            .then(
                console.log("[REMOÇÃO].")
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
}
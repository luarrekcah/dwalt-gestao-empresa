const { getDatabase, set, ref, push, query, equalTo, update, remove, onValue, child } = require('@firebase/database');

module.exports = {
    create: ({path, params}) => {
        const db = getDatabase();
        push(ref(db, path), params).then(
            console.log("[GRAVAÇÃO].")
        ).catch((error) => {
            console.warn(error);
        });
    },
    update: ({path, params}) => {
        const db = getDatabase();
        update(ref(db, path),
            params
        ).then(
            console.log("[ATUALIZAÇÃO].")
        ).catch((error) => {
            console.log(error);
        });
    },
}
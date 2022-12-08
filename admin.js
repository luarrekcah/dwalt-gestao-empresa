const admin = require('firebase-admin');
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.databaseURL
    });
    console.log('[LOG] Conectado ao ADMIN')
} catch (error) {
    console.error(error);
}
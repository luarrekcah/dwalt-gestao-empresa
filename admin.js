const admin = require('firebase-admin');
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.project_id,
            privateKeyId: process.env.private_key_id,
            privateKey: process.env.private_key.replace(/\\n/g, '\n'),
            clientEmail: process.env.client_email,
        }),
        databaseURL: process.env.databaseURL
    });
    console.log('[LOG] Conectado ao ADMIN')
} catch (error) {
    console.error(error);
}
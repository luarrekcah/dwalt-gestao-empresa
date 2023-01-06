const express = require("express"),
    router = express.Router();

const admin = require('firebase-admin');

const { getAllItems } = require("../../database/users");

router.get("/", async (req, res, next) => {
    res.sendStatus(200);
});

router.get("/notification", async (req, res, next) => {
    res.sendStatus(400);
});

router.post("/notification", async (req, res, next) => {
    const { title, body, key, to } = req.query;
    if (!title || !body || !key || !to) {
        return res.sendStatus(406)//.json({ error: 'missing params' });
    } else {
        const tokens = [];

        if (to === 'staffs') {
            const staffs = await getAllItems({ path: `gestaoempresa/business/${key}/staffs` });
            staffs.forEach(i => {
                if (i.data.token) {
                    tokens.push(i.data.token)
                }
            });
        } else {
            return res.sendStatus(406)//.json({ error: 'missing params' });
        }

        if (tokens.length === 0) {
            return res.sendStatus(404)//.json({ error: 'tokens null' });
        } else {
            await admin.messaging().sendMulticast({
                tokens,
                notification: {
                    title,
                    body,
                },
            });
            return res.sendStatus(201);
        }
    }
});

module.exports = router;

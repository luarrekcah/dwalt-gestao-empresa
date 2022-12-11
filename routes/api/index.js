const express = require("express"),
    router = express.Router();


router.post("/", async (req, res, next) => {
    res.sendStatus(200);
});
const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    res.render("pages/errors/notfound");
});

module.exports = router;
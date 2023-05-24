
const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    res.render("pages/landingpage/index");
});

module.exports = router;
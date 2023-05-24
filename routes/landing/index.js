
const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    res.render("pages/landingpage/index");
});

router.get("/politicas", async (req, res, next) => {
    res.render("pages/landingpage/policy");
});


router.get("/termos", async (req, res, next) => {
    res.render("pages/landingpage/terms");
});

module.exports = router;
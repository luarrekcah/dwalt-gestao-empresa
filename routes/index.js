const express = require("express"),
    router = express.Router(),
    { getDatabase, ref, onValue } = require("@firebase/database"),
    fs = require("fs"),
    xml = fs.readFileSync(__dirname + '/../public/sitemap.xml');

router.get("/", (req, res) => {
    res.render("pages/login");
});

router.post("/", (req, res) => {
    console.log(req.body);
});

router.get("/registro", (req, res) => {
    res.render("pages/login/registro.ejs");
});

router.post("/registro", (req, res) => {
    console.log(req.body);
});


module.exports = router;
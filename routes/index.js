const express = require("express"),
    router = express.Router(),
    { getDatabase, ref, onValue } = require("@firebase/database"),
    fs = require("fs"),
    xml = fs.readFileSync(__dirname + '/../public/sitemap.xml');

router.get("/", (req, res) => {
    res.render("pages/index", data);
});


module.exports = router;
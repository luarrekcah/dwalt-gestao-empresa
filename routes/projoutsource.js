
const { getAllItems, getUser } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    const projsout = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projoutsource` }),
    user = await getUser({ userId: req.user.key })
    const data = {
        user,
        projsout,
        message: null,
    }
    res.render("pages/projouts", data);
});

router.get("/novo", async (req, res, next) => {
    const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` });
    const user = await getUser({ userId: req.user.key })
    const data = {
        user,
        message: null,
        projects
    }
    res.render("pages/projouts/new", data);
});

router.post("/novo", async (req, res, next) => {
   console.log(req.body);
   res.sendStatus(200);
});

module.exports = router;
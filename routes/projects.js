const express = require("express"),
    router = express.Router(),
    moment = require('../services/moment'),
 { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
 { getDate } = require("../auth/functions/database"),
 { createItem, getAllItems, getItems } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const projects = await getAllItems({path: `gestaoempresa/business/${req.user.key}/projects`});
        const data = {
            user: req.user,
            projects,
        };
        res.render("pages/projects", data);
    } else {
        res.redirect("/");
    }
});

router.get("/adicionar", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const data = {
        user: req.user,
    };
    res.render("pages/projects/new", data);
});

router.post("/adicionar", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const project = req.body;
    project.createdAt = getDate(moment);
    createItem({path: `gestaoempresa/business/${req.user.key}/projects`, params: project});
    return res.redirect("/dashboard/projetos?message=registered");
});

router.get("/visualizar/:id", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const project = await getItems({path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`});
    const data = {
        user: req.user,
        project,
    };
    res.render("pages/projects/see", data);
});

module.exports = router;
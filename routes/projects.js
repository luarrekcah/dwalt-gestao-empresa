const express = require("express"),
    router = express.Router(),
    moment = require('../services/moment'),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { getDate } = require("../auth/functions/database"),
    { createItem, getAllItems, getItems, getUser, deleteItem, updateItem } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` });
        const user = await getUser({ userId: req.user.key });

        let message;
    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case "registrado":
                message = { type: 'success', title: 'Projeto registrado!', description: 'Clique em OK para ver as informações atualizadas.' }
                break;
                case "deletado":
                message = { type: 'success', title: 'Projeto deletado!', description: 'Clique em OK para ver as informações atualizadas.' }
                break;
            default:
                message = null;
                break;
        }
    } else {
        message = null;
    }

        const data = {
            user,
            projects,
            message,
        };
        res.render("pages/projects", data);
    } else {
        res.redirect("/");
    }
});

router.post("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    switch (req.body.type) {
        case "DELETE_PROJECT":
            deleteItem({ path: `gestaoempresa/business/${req.user.key}/projects/${req.body.projectId}` })
            break;
    }
    return res.redirect("/dashboard/projetos?message=deletado");
});

router.get("/adicionar", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const data = {
        user,
        message: null,
    };
    res.render("pages/projects/new", data);
});

router.post("/adicionar", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const project = req.body;
    project.createdAt = getDate(moment);
    createItem({ path: `gestaoempresa/business/${req.user.key}/projects`, params: project });
    createLogs(req.user.key, "Projeto adicionado.");
    return res.redirect("/dashboard/projetos?message=registrado");
});

router.get("/visualizar/:id", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const project = await getItems({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}` });
    const documents = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents` });
    const photos = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/photos` });
    let message;
    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case "editado":
                message = { type: 'success', title: 'Projeto editado!', description: 'Clique em OK para ver as informações atualizadas.' }
                break;
            case "criado":
                message = { type: 'success', title: 'Documento adicionado!', description: 'Clique em OK para ver as informações atualizadas.' }
                break;
            case "deletado":
                message = { type: 'success', title: 'Documento deletado!', description: 'Clique em OK para ver as informações atualizadas.' }
                break;
            default:
                message = null;
                break;
        }
    } else {
        message = null;
    }
    const data = {
        user,
        project,
        documents,
        message,
        photos,
    };
    res.render("pages/projects/see", data);
});

router.post("/visualizar/:id", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    let status;
    switch (req.body.type) {
        case "CREATE_DOCUMENT":
            status = 'criado'
            createItem({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents`, params: req.body });
            createLogs(req.user.key, "Documento adicionado a um projeto.");
            break;
        case "DELETE_DOCUMENT":
            status = 'deletado'
            deleteItem({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents/${req.body.documentId}` });
            createLogs(req.user.key, "Documento deletado de um projeto.");
            break;
    }
    return res.redirect("/dashboard/projetos/visualizar/" + req.params.id + "?message=" + status);
});

router.get("/editar/:id", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const project = await getItems({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}` });
    const data = {
        user,
        project,
        message: null,
    };
    res.render("pages/projects/edit", data);
});

router.post("/editar/:id", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    updateItem({ path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`, params: req.body });
    createLogs(req.user.key, "Projeto atualizado.");
    return res.redirect("/dashboard/projetos/visualizar/" + req.params.id + "?message=editado");
});

router.get("/config", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const data = {
        user,
        message: null,
    };
    res.render("pages/projects/config", data);
});

module.exports = router;
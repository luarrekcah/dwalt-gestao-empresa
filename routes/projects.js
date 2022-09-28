const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/projects", data);
    } else {
        res.redirect("/");
    }
});

router.get("/adicionar", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/projects/new", data);
    } else {
        res.redirect("/");
    }
});

router.post("/adicionar", (req, res, next) => {
    let allProjects;
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa/projetos");
    onValue(projectsdb, async (snapshot) => {
        if (snapshot.val() === null) {
            allProjects = [];
        } else {
            allProjects = snapshot.val();
        };
        const project = req.body;
        project.business = req.user._id;
        allProjects.push(project)
        set(ref(db, "gestaoempresa/projetos"), allProjects);

        return res.redirect("/dashboard/projetos?message=registered");
    })
});

module.exports = router;
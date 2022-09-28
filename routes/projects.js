const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa/projetos");
    onValue(projectsdb, async (snapshot) => {
        const projects = snapshot.val().filter(item => item.business === req.user._id);
        const data = {
            user: req.user,
            projects,
        };
        res.render("pages/projects", data);
    });
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
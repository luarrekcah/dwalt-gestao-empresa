const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa/projetos");
    onValue(projectsdb, async (snapshot) => {
        let projects;
        if(snapshot.val() === null || snapshot.val() === undefined) {
            projects = [];
        } else {
            projects = snapshot.val().filter(item => item.business === req.user._id);
        }
        const data = {
            user: req.user,
            projects,
        };
        res.render("pages/projects", data);
    }, {
        onlyOnce: true
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
    onValue(projectsdb, (snapshot) => {
        if (snapshot.val() === null) {
            allProjects = [];
        } else {
            allProjects = snapshot.val();
        };
        const project = req.body;
        allProjects.push(project)
        set(ref(db, "gestaoempresa/projetos"), allProjects);

        return res.redirect("/dashboard/projetos?message=registered");
    }, {
        onlyOnce: true
      })
});

module.exports = router;
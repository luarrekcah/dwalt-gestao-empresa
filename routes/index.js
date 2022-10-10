const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database"),
    fs = require("fs"),
    xml = fs.readFileSync(__dirname + '/../public/sitemap.xml'),
    bcrypt = require("bcryptjs"),
    passport = require("passport"),
    moment = require('moment');

const { getDate } = require("../auth/functions/database");
const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/sitemap.xml", function (req, res, next) {
    res.set("Content-Type", "text/xml");
    res.send(xml);
});

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.redirect("/dashboard");
    } else {
        res.render("pages/login");
    }
});

router.post(
    "/",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "?message=credentialserror",
    })
);

router.get("/registro", (req, res) => {
    res.render("pages/login/registro.ejs");
});

router.post("/registro", (req, res) => {
    const data = req.body;
    console.log(data);
    if (data.password !== data.passwordConf) return res.redirect('?message=passwordsdontmatch');
    if (data['g-recaptcha-response'] === '') return res.redirect('?message=errorrecaptcha');
    const db = getDatabase();
    const users = ref(db, "gestaoempresa/empresa");
    onValue(users, (snapshot) => {
        let allUsers;
        if (snapshot.val() === null) {
            allUsers = [];
        } else {
            allUsers = snapshot.val();
        };
        const user = {
            _id: data.email,
            email: data.email,
            password: bcrypt.hashSync(data.password),
            verified: false,
            documents: {
                nome_fantasia: data.nomeF,
                cnpj: data.cnpj,
            },
            profile: {
                logo: data.logo,
                about: data.about
            },
            contact: {
                number: ""
            },
            contractURL: "",
            createdAt: getDate(moment),
        };

        const checkUnique = () => {
            return allUsers.find((item) => item.email === user.email);
        };

        if (checkUnique())
            return res.redirect('/?fail=true&message=userexists');

        allUsers.push(user);
        set(ref(db, "gestaoempresa/empresa"), allUsers);

        return res.redirect("/?message=registered");
    }, {
        onlyOnce: true
      });
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get("/esqueciasenha", (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
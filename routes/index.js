const express = require("express"),
    router = express.Router(),
    fs = require("fs"),
    xml = fs.readFileSync(__dirname + '/../public/sitemap.xml'),
    bcrypt = require("bcryptjs"),
    passport = require("passport"),
    moment = require('moment'),
    { getDate } = require("../auth/functions/database"),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { createItem, getAllItems } = require("../database/users");

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

router.post("/registro", async (req, res) => {
    const data = req.body;
    if (data.password !== data.passwordConf) return res.redirect('?message=passwordsdontmatch');
    if (data['g-recaptcha-response'] === '') return res.redirect('?message=errorrecaptcha');
    const allUsers = await getAllItems({ path: 'gestaoempresa/business' })
    const user = {
        info: {
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
        }
    };
    const checkUnique = () => {
        return allUsers.find((item) => item.data.info.email === user.email);
    };
    if (checkUnique())
        return res.redirect('/?fail=true&message=userexists');
    createItem({ path: 'gestaoempresa/business', params: user })
    return res.redirect("/?message=registered");
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
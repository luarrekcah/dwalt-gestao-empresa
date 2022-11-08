const express = require("express"),
    router = express.Router(),
    fs = require("fs"),
    xml = fs.readFileSync(__dirname + '/../public/sitemap.xml'),
    bcrypt = require("bcryptjs"),
    passport = require("passport"),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    { getDate } = require("../auth/functions/database"),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { createItem, getAllItems, updateItem } = require("../database/users");

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
    res.render("pages/login/forgot.ejs");
});

router.post("/esqueciasenha", async (req, res, next) => {
    const { email } = req.body;
    const business = await getAllItems({ path: `gestaoempresa/business` });
    const foundBusiness = await business.find(i => i.data.info.email === email);
    if (foundBusiness !== undefined) {
        const jwtToken = jwt.sign({
            id: foundBusiness.key
        }, 'forgotpassword', { expiresIn: '1h' })

        updateItem({ 
            path: `gestaoempresa/business/${foundBusiness.key}/info`, 
            params: { token: jwtToken } 
        });

        /*
         *   ENVIAR EMAIL COM ENDERECO
         *   https://site/resetarsenha?token=${token}
         */

        //return res.redirect('/esqueciasenha?message=checkemail');
        return res.redirect(`resetarsenha?token=${jwtToken}`);
    } else {
        return res.redirect('/esqueciasenha?message=notfound');
    }
});

router.get("/resetarsenha", async (req, res, next) => {
    const { token } = req.query;
    let data = {};

    if (!token || token.length < 100) {
        return res.redirect('/');
    }
    jwt.verify(token, 'forgotpassword', async (err, decoded) => {
        if (err) {
            console.log(err);
            data.sys = "InvalidToken"
        } else {
            const business = await getAllItems({ path: `gestaoempresa/business` });
            const foundBusiness = await business.find(i => i.data.info.token === token);
            if (foundBusiness !== undefined && foundBusiness.key === decoded.id) {
                data.id = decoded.id;
                data.sys = "PermissionGranted";
            } else {
                data.sys = "NotFound";
            }
        }
        return res.render("pages/login/reset.ejs", data);
    });
});

router.post("/resetarsenha", async (req, res, next) => {
    console.log(req.body);
    const { password, passwordConf, id } = req.body;
    const { token } = req.query;
    if (password === passwordConf) {
        updateItem({
            path: `gestaoempresa/business/${id}/info`,
            params: { password: bcrypt.hashSync(password), token: null }
        });
        return res.redirect(`/?message=RedefinedPassword`);
    } else {
        return res.redirect(`/resetarsenha?message=PasswordDontMatch&token=${token}`);
    }
});

module.exports = router;
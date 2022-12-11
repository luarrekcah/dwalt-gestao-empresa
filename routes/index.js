const { sendForgotPasswordEmail } = require("../services/nodemailer");

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
    { createItem, getAllItems, updateItem, createLogs } = require("../database/users");

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.redirect("/dashboard");
    } else {
        let message;
        if (req.query.message) {
            switch (req.query.message.toLowerCase()) {
                case "redefinedpassword":
                    message = { type: 'success', title: 'Sua senha foi redefinida!', description: 'Clique em OK e faça login com as novas credenciais.' }
                    break;
                case "userexists":
                    message = { type: 'warning', title: 'Usuário já existe!', description: 'Clique em OK e faça login com as credenciais ou recupere sua conta.' }
                    break;
                case "credentialserror":
                    message = { type: 'error', title: 'Email ou senha incorreta!', description: '' }
                    break;
                default:
                    message = null;
                    break;
            }
        } else {
            message = null;
        }
        const data = {
            message,
        }
        res.render("pages/login", data);
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
    let message;
    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case "passwordsdontmatch":
                message = { type: 'error', title: 'Senhas não coincidem!', description: 'Insira a mesma senha nos dois campos de senha.' }
                break;
            case "errorrecaptcha":
                message = { type: 'error', title: 'Verifique o captcha!', description: 'Ei! Você não passou pela verificação de robô' }
                break;
            case "registered":
                message = { type: 'success', title: 'Usuário registrado com sucesso!', description: 'Clique em OK e faça login com as credenciais.' }
                break;
            default:
                message = null;
                break;
        }
    } else {
        message = null;
    }

    const data = {
        message,
    }

    res.render("pages/login/registro.ejs", data);
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
        createLogs(user.key, "Usuário deslogado.");
        res.redirect('/');
    });
});

router.get("/esqueciasenha", (req, res, next) => {
    let message;
    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case "notfound":
                message = { type: 'error', title: 'Não encontrado!', description: 'O e-mail inserido não pertence a uma conta.' }
                break;
            case "checkemail":
                message = { type: 'info', title: 'E-mail enviado!', description: 'Enviamos um e-mail com o token para resetar sua senha.' }
                break;
            default:
                message = null;
                break;
        }
    } else {
        message = null;
    }
    const data = {
        message,
    }
    res.render("pages/login/forgot.ejs", data);
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
        createItem({
            path: `gestaoempresa/business/${foundBusiness.key}/logs`, params: {
                type: 'forgotpassword',
                date: getDate(),
            }
        });
        sendForgotPasswordEmail(email, `https://${req.get('host')}/resetarsenha?token=${jwtToken}`);
        
        createLogs(foundBusiness.key, "Token de recuperação de conta criado");
        return res.redirect('/esqueciasenha?message=checkemail');
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
            data.message = { type: 'error', title: 'Token inválido!', description: 'O token inserido é inválido.' }
        } else {
            const business = await getAllItems({ path: `gestaoempresa/business` });
            const foundBusiness = await business.find(i => i.data.info.token === token);
            if (foundBusiness !== undefined && foundBusiness.key === decoded.id) {
                data.id = decoded.id;
                data.message = { type: 'success', title: 'Token válido!', description: 'Clique em OK e redefina sua senha.' }
            } else {
                data.message = { type: 'error', title: 'Empresa não encontrada!', description: 'O token inserido é inválido.' }
            }
        }
        if (data.id === undefined) {
            data.id = null;
            data.message = { type: 'error', title: 'Token inválido!', description: 'O token inserido é inválido.' }
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
        createItem({
            path: `gestaoempresa/business/${id}/logs`, params: {
                type: 'resetedpassword',
                date: getDate(),
            }
        });
        createLogs(user.key, "Senha atualizada.");
        return res.redirect(`/?message=RedefinedPassword`);
    } else {
        return res.redirect(`/resetarsenha?message=PasswordDontMatch&token=${token}`);
    }
});

module.exports = router;
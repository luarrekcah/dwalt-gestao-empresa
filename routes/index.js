const {
  sendEmail,
} = require("../services/nodemailer");

const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  useragent = require("useragent"),
  {
    authenticationMiddlewareTrueFalse,
  } = require("../auth/functions/middlewares"),
  {
    getAllItems,
  } = require("../database/users");

router.get("/", (req, res, next) => {
  if (authenticationMiddlewareTrueFalse(req, res, next)) {
    res.redirect("/dashboard");
  } else {
    let message;
    if (req.query.message) {
      switch (req.query.message.toLowerCase()) {
        case "redefinedpassword":
          message = {
            type: "success",
            title: "Sua senha foi redefinida!",
            description: "Clique em OK e faça login com as novas credenciais.",
          };
          break;
        case "userexists":
          message = {
            type: "warning",
            title: "Usuário já existe!",
            description:
              "Clique em OK e faça login com as credenciais ou recupere sua conta.",
          };
          break;
          case "registered":
          message = {
            type: "success",
            title: "Usuário registrado!",
            description:
              "Clique em OK e faça login com as credenciais da sua conta.",
          };
          break;
        case "credentialserror":
          message = {
            type: "error",
            title: "Email ou senha incorreta!",
            description: "",
          };
          break;
        case "deleted_subscription":
          message = {
            type: "error",
            title: "Assinatura deletada",
            description: "Entre em contato com o suporte para regularizar.",
          };
          break;
        case "pending_subscription":
          message = {
            type: "warning",
            title: "Assinatura pendente",
            description:
              "Conclua seu pagamento para começar a usar a plataforma.",
          };
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
    };
    res.render("pages/login", data);
  }
});

router.post(
  "/",
  async (req, res, next) => {
    if (process.env.DEV) return next();
    const users = await getAllItems({ path: `gestaoempresa/business` });
    const user = users.find((item) => item.data.info.email === req.body.email);
    if (!user) return next();

    const isValid = bcrypt.compareSync(
      req.body.password,
      user.data.info.password
    );

    const userAgentString = req.headers["user-agent"];
    const agent = useragent.parse(userAgentString);
    const browser = agent.toAgent();
    const ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (isValid) {
      sendEmail(req.body.email, {
        title: "Login Realizado",
        message: `<p>Nos preocupamos com a segurança da sua conta e seus dados. Dados do login:</p>
        <p>IP: ${ip}</p>
        <p>HORÁRIO: ${new Date()}</p>
        <p>NAVEGADOR: ${browser}</p>
        <p>Não foi você? <a href="https://connect.dlwalt.com/esqueciasenha">troque sua senha<a></p>
        `,
      });
    } else {
      sendEmail(req.body.email, {
        title: "Tentativa de login",
        message: `<p>Nos preocupamos com a segurança da sua conta e seus dados. Dados do login:</p>
        <p>IP: ${ip}</p>
        <p>HORÁRIO: ${new Date()}</p>
        <p>NAVEGADOR: ${browser}</p>
        <p>Não foi você? <a href="https://connect.dlwalt.com/esqueciasenha">troque sua senha<a></p>
        `,
      });
    }
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "?message=credentialserror",
  })
);


module.exports = router;

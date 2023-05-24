const { getDate } = require("../auth/functions/database");
const {
  getAllItems,
  updateItem,
  createItem,
  createLogs,
} = require("../database/users");

const express = require("express"),
  router = express.Router();

const jwt = require("jsonwebtoken");
const { sendForgotPasswordEmail } = require("../services/nodemailer");

router.get("/", (req, res, next) => {
  let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "notfound":
        message = {
          type: "error",
          title: "Não encontrado!",
          description: "O e-mail inserido não pertence a uma conta.",
        };
        break;
      case "checkemail":
        message = {
          type: "info",
          title: "E-mail enviado!",
          description: "Enviamos um e-mail com o token para resetar sua senha.",
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
  res.render("pages/login/forgot.ejs", data);
});

router.post("/", async (req, res, next) => {
  const { email } = req.body;
  const business = await getAllItems({ path: `gestaoempresa/business` });
  const foundBusiness = await business.find((i) => i.data.info.email === email);
  if (foundBusiness !== undefined) {
    const jwtToken = jwt.sign(
      {
        id: foundBusiness.key,
      },
      process.env.forgotpassword,
      { expiresIn: "1h" }
    );

    updateItem({
      path: `gestaoempresa/business/${foundBusiness.key}/info`,
      params: { token: jwtToken },
    });
    createItem({
      path: `gestaoempresa/business/${foundBusiness.key}/logs`,
      params: {
        type: "forgotpassword",
        date: getDate(),
      },
    });
    sendForgotPasswordEmail(
      email,
      `https://${req.get("host")}/resetarsenha?token=${jwtToken}`
    );

    createLogs(foundBusiness.key, "Token de recuperação de conta criado");
    return res.redirect("/esqueciasenha?message=checkemail");
  } else {
    return res.redirect("/esqueciasenha?message=notfound");
  }
});

module.exports = router;

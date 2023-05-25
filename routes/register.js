const { getDate } = require("../auth/functions/database");
const { createItem, getAllItems } = require("../database/users");

const bcrypt = require("bcryptjs");
const moment = require('moment');

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
  let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "passwordsdontmatch":
        message = {
          type: "error",
          title: "Senhas não coincidem!",
          description: "Insira a mesma senha nos dois campos de senha.",
        };
        break;
      case "errorrecaptcha":
        message = {
          type: "error",
          title: "Verifique o captcha!",
          description: "Ei! Você não passou pela verificação de robô",
        };
        break;
      case "registered":
        message = {
          type: "success",
          title: "Usuário registrado com sucesso!",
          description: "Clique em OK e faça login com as credenciais.",
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

  res.render("pages/login/registro.ejs", data);
});

router.post("/", async (req, res) => {
  const data = req.body;
  if (data.password !== data.passwordConf)
    return res.redirect("?message=passwordsdontmatch");
  if (data["g-recaptcha-response"] === "")
    return res.redirect("?message=errorrecaptcha");
  const allUsers = await getAllItems({ path: "gestaoempresa/business" });

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
        logo: "https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png",
        about: data.about,
      },
      contact: {
        number: "",
      },
      contractURL: "",
      createdAt: getDate(),
    },
  };
  const checkUnique = () => {
    return allUsers.find(
      (item) =>
        item.data.info.email === user.info.email ||
        item.data.info.documents.cnpj === user.info.cnpj
    );
  };
  if (checkUnique()) return res.redirect("/?fail=true&message=userexists");
  createItem({ path: "gestaoempresa/business", params: user });
  return res.redirect("/?message=registered");
});

module.exports = router;

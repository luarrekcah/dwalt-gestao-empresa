const express = require("express"),
  router = express.Router();

const jwt = require("jsonwebtoken");
const {
  getAllItems,
  updateItem,
  createItem,
  createLogs,
} = require("../database/users");
const bcrypt = require("bcryptjs");
const { getDate } = require("../auth/functions/database");

router.get("/", async (req, res, next) => {
  const { token } = req.query;
  let data = {};

  if (typeof token !== "string" || !token || token.length < 100) {
    return res.redirect("/login");
  }
  jwt.verify(token, process.env.forgotpassword, async (err, decoded) => {
    if (err) {
      console.log(err);
      data.message = {
        type: "error",
        title: "Token inválido!",
        description: "O token inserido é inválido.",
      };
    } else {
      const business = await getAllItems({ path: `gestaoempresa/business` });
      const foundBusiness = await business.find(
        (i) => i.data.info.token === token
      );
      if (foundBusiness !== undefined && foundBusiness.key === decoded.id) {
        data.id = decoded.id;
        data.message = {
          type: "success",
          title: "Token válido!",
          description: "Clique em OK e redefina sua senha.",
        };
      } else {
        data.message = {
          type: "error",
          title: "Empresa não encontrada!",
          description: "O token inserido é inválido.",
        };
      }
    }
    if (data.id === undefined) {
      data.id = null;
      data.message = {
        type: "error",
        title: "Token inválido!",
        description: "O token inserido é inválido.",
      };
    }
    return res.render("pages/login/reset.ejs", data);
  });
});

router.post("/", async (req, res, next) => {
  console.log(req.body);
  const { password, passwordConf, id } = req.body;
  const { token } = req.query;
  if (password === passwordConf) {
    updateItem({
      path: `gestaoempresa/business/${id}/info`,
      params: { password: bcrypt.hashSync(password), token: null },
    });
    createItem({
      path: `gestaoempresa/business/${id}/logs`,
      params: {
        type: "resetedpassword",
        date: getDate(),
      },
    });
    createLogs(user.key, "Senha atualizada.");
    return res.redirect(`/login?message=RedefinedPassword`);
  } else {
    return res.redirect(
      `/resetarsenha?message=PasswordDontMatch&token=${token}`
    );
  }
});
module.exports = router;

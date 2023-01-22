const { updateItem, getUser } = require("../database/users");

const express = require("express"),
  router = express.Router(),
  asaasAPI = require("node-asaas-api");

require("dotenv").config();

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

asaasAPI.config(params);

router.get("/", async (req, res, next) => {
  res.render("pages/payments");
});

router.post("/", async (req, res, next) => {
  let cliente = req.body;
  console.log(cliente);

  const user = await getUser({ userId: req.user.key });

  cliente.externalReference = req.user.id;

  cliente.company = user.data.documents.nome_fantasia;

  //format
  /*cliente.cpfCnpj = cliente.cpfCnpj.replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
  cliente.mobilePhone = cliente.mobilePhone.replaceAll("+", "").replaceAll("-", "").replaceAll("(", "").replaceAll(")", "");
  cliente.phone = cliente.mobilePhone;*/

  asaasAPI.customers.post(cliente).then((responseAsaas) => {
    console.log("Cliente Cadastrado");
    console.log(responseAsaas.data);
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info`,
      params: {
        asaasID: responseAsaas.data.id,
        subscriptionID: "",
      },
    });
    return res.redirect("/pagamento/assinatura");
  });
  return res.redirect("/");
});

router.get("/assinatura", async (req, res, next) => {
  res.render("pages/payments/subscription");
});

router.post("/assinatura", async (req, res, next) => {
  console.log(req.body);

  const dados = req.body;
  const card = dados.data;

  const user = await getUser({ userId: req.user.key });

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 2;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  let date = year + "-" + month + "-" + day;

  let assinatura = {
    customer: user.data.infos.asaasID,
    value: process.env.valorAssinatura,
    nextDueDate: date,
    cycle: "MONTHLY",
    description:
      "Mensalidade do sistema Connect para gestão de projetos fotovoltaicos.",
  };

  switch (dados.type) {
    case "card":
      assinatura.billingType = "CREDIT_CARD";
      assinatura.creditCard.holderName = card.holderName;
      assinatura.number = card.number;
      assinatura.expiryMonth = card.expiryMonth;
      assinatura.expiryYear = `20${card.expiryYear}`;
      assinatura.cvv = `20${card.cvv}`;
      break;
  }

  res.sendStatus(200);
});

module.exports = router;

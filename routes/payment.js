const { updateItem, getUser, getItems } = require("../database/users");

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
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info/paymentProfile`,
      params: {
        cliente
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

  const user = await getUser({ userId: req.user.key });
  //const paymentProfile = await getItems({path: `gestaoempresa/business/${userId}/info`})
  const {paymentProfile} = user

  if (user.data.asaasID === undefined) {
    return res.sendStatus(200);
  }

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 2;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  let date = year + "-" + month + "-" + day;

  let assinatura = {
    customer: user.data.asaasID,
    value: process.env.valorAssinatura,
    nextDueDate: date,
    cycle: "MONTHLY",
    description:
      "Mensalidade do sistema Connect para gestão de projetos fotovoltaicos.",
  };

  switch (dados.type) {
    case "card":
      assinatura.billingType = "CREDIT_CARD";
      assinatura.creditCard = {
        holderName: req.body.data.holderName,
        number: req.body.data.number,
        expiryMonth: req.body.data.expiryMonth,
        expiryYear: `20${req.body.data.expiryYear}`,
        cvv: `20${req.body.data.cvv}`,
      };
      assinatura.creditCardHolderInfo = paymentProfile;
      break;
  }

  asaasAPI.subscriptions
    .post(assinatura)
    .then((res) => {
      console.log("Assinatura adicionada para o Cliente");
      console.log(res.data);
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("Erro no cadastro da assinatura");
      console.log("Status: ", error.response.status);
      console.log("StatusText: ", error.response.statusText);
      console.log("Data: ", error.response.data);

      switch (error.response.data.erros[0].code) {
        case "invalid_creditCard":
          res.redirect("/pagamento/assinatura?message=invalid_creditCard");
          break;
        default:
          res.redirect("/pagamento/assinatura?message=error");
          break;
      }
    });
});

module.exports = router;

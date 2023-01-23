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

  cliente.externalReference = req.user.key;

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
        paymentProfile: cliente,
      },
    });
    return res.redirect("/pagamento/assinatura");
  });
  //return res.redirect("/");
});

router.get("/assinatura", async (req, res, next) => {
  res.render("pages/payments/subscription");
});

router.post("/assinatura", async (req, res, next) => {
  console.log(req.body);

  const dados = req.body;

  const user = await getUser({ userId: req.user.key });
  const { paymentProfile } = user;

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
        ccv: req.body.data.cvv,
      };
      assinatura.creditCardHolderInfo = paymentProfile;
      break;
    case "boleto":
      assinatura.billingType = "BOLETO";
      break;
    case "pix":
      assinatura.billingType = "PIX";
      break;
  }

  asaasAPI.subscriptions
    .post(assinatura)
    .then((resp) => {
      console.log("Assinatura adicionada para o Cliente");
      console.log(resp.data);
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/info`,
        params: {
          subscriptionID: resp.data.id,
        },
      });
      if(dados.type === 'card') {
        if(resp.data.status === "ACTIVE") {
          return res.redirect("/dashboard");
        } else {
          return res.redirect("/");
        }
      } else {
        return res.redirect("/");
      }
      
    })
    .catch((error) => {
      if (error) {
        console.log("Erro no cadastro da assinatura");
        console.log("Status: ", error.response.status);
        console.log("StatusText: ", error.response.statusText);
        console.log("Data: ", error.response.data);
        if (error.response.data) {
          switch (error.response.data.errors[0].code) {
            case "invalid_creditCard":
              return res.redirect(
                "/pagamento/assinatura?message=invalid_creditCard"
              );
            default:
              return res.redirect("/pagamento/assinatura?message=error");
          }
        } else {
          return res.redirect("/pagamento/assinatura?message=error");
        }
      }
    });
});

router.get("/sucesso", async (req, res, next) => {
  res.render("pages/payments/messages/success");
});

router.get("/erro", async (req, res, next) => {
  res.render("pages/payments/messages/error");
});

module.exports = router;

const { updateItem, getUser, getItems } = require("../database/users");
const { newCustomer, newSubscription } = require("../services/asaas");

const express = require("express"),
  router = express.Router({ mergeParams: true });

require("dotenv").config();

router.get("/", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  if (user.data.asaasID !== "" && user.data.asaasID !== undefined)
    return res.redirect("/pagamento/assinatura");
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

  newCustomer(cliente).then((responseAsaas) => {
    console.log("Cliente Cadastrado");
    console.log(responseAsaas);
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info`,
      params: {
        asaasID: responseAsaas.id,
        subscriptionID: "",
        paymentProfile: cliente,
      },
    });
    return res.redirect("/pagamento/assinatura");
  });
  //return res.redirect("/");
});

router.get("/assinatura", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const subscriptionValue = await getItems({path: 'gestaoempresa/config/subscriptionValue'})
  if (
    user.data.subscriptionID !== "" &&
    user.data.subscriptionID !== undefined &&
    user.data.acessConnect
  )
    return res.redirect("/dashboard");
  let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "error":
        message = {
          type: "error",
          title: "Ocorreu um erro!",
          description:
            "Retorne ao login ou entre em contato com o suporte caso o problema persista.",
        };
        break;
      case "invalid_creditcard":
        message = {
          type: "error",
          title: "Cartão de crédito inválido",
          description: "Tente outro cartão.",
        };
        break;
    }
  } else {
    message = null;
  }

  const data = {
    message,
    subscriptionValue,
  }
  
  res.render("pages/payments/subscription", data);
});

router.post("/assinatura", async (req, res, next) => {
  console.log(req.body);

  const subscriptionValue = await getItems({path: 'gestaoempresa/config/subscriptionValue'})

  if(subscriptionValue === '' || typeof subscriptionValue !== 'number') {
    return res.redirect("/pagamento/erro?message=erro");
  }

  const dados = req.body;

  const user = await getUser({ userId: req.user.key });
  const { paymentProfile } = user;

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1; //2; -> 2 for give a month free
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  let date = year + "-" + month + "-" + day;

  let assinatura = {
    customer: user.data.asaasID,
    value: subscriptionValue,
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

  try {
    const resp = await newSubscription(assinatura);
    console.log("Assinatura adicionada para o Cliente");
    console.log(resp);
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info`,
      params: {
        subscriptionID: resp.id,
        acessConnect: true,
      },
    });
    if (resp.status === "ACTIVE") {
      return res.redirect("/pagamento/pagar");
    } else {
      return res.redirect("/pagamento/aguarde");
    }
  } catch (error) {
    console.log("Erro no cadastro da assinatura");
    console.log("Status: ", error.response.status);
    console.log("StatusText: ", error.response.statusText);
    console.log("Data: ", error.response.data);
    if (error.response.data) {
      if (error.response.data.errors[0].code === "invalid_creditCard") {
        //nao está redirecionando de vdd
        return res.redirect("/pagamento/erro?message=invalid_card");
      } else {
        return res.redirect("/pagamento/erro?message=erro");
      }
    }
  }
});

router.get("/sucesso", async (req, res, next) => {
  res.render("pages/payments/messages/success");
});

router.get("/erro", async (req, res, next) => {
  let message = "";
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "deleted_subscription":
        message = "Sua mensalidade foi deletada.";
        break;
      case "invalid_card":
        message = "Cartão inválido, tente outro.";
        break;
      case "pending_subscription":
        message = "Pagamento da sua mensalidade está pendente.";
        break;
      case "erro":
        message = "Verifique seu método de pagamento e tente novamente.";
        break;
    }
  }
  res.render("pages/payments/messages/error", { message });
});

router.get("/pagar", async (req, res, next) => {
  res.render("pages/payments/messages/pay");
});

module.exports = router;

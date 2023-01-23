const { sendNotification } = require("../../services/nodemailer");
const { getCustomer } = require("../../services/asaas");

const { updateItem } = require("../../database/users");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  res.sendStatus(200);
});

router.get("/teste", async (req, res, next) => {
  res.sendStatus(200);
});

router.post("/", async (req, res, next) => {
  const webhookData = req.body;
  console.log(webhookData);

  const customer = await getCustomer(webhookData.payment.customer);

  switch (webhookData.event) {
    case "PAYMENT_CONFIRMED":
      //LIBERAR ACESSO AO SISTEMA E MANDAR EMAIL DE CONFIRMAÇÃO
      sendNotification([customer.email], {
        title: "PAGAMENTO CONFIRMADO!",
        message: "Você já pode utilizar a nossa plataforma a vontade!",
      });
      updateItem({
        path: `gestaoempresa/business/${customer.externalReference}/info`,
        params: {
          acessConnect: true
        }
      });
      //-->
      break;
    case "PAYMENT_RECEIVED":
      //-->
      sendNotification([customer.email], {
        title: "PAGAMENTO RECEBIDO",
        message:
          "Recebemos sua solicitação de pagamento, assim que confirmado iremos liberar o seu sistema.",
      });
      //MANDAR EMAIL FALANDO QUE O PAGAMENTO FOI RECEBIDO E ASSIM QUE CONFIRMADO SERÁ LIBERADO O ACESSO
      break;
  }

  res.sendStatus(200);
});

module.exports = router;

const { sendNotification } = require("../../services/nodemailer");
const { getCustomer } = require("../../services/asaas");

const { updateItem } = require("../../database/users");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  res.sendStatus(200);
});

router.post("/", async (req, res, next) => {
  const webhookData = req.body;
  
  if(Object.keys(webhookData).length === 0) return res.sendStatus(400);
  
  console.log(webhookData);
  
  let customer;

  try{
    customer = await getCustomer(webhookData.payment.customer);
  } catch (e) {
    console.log(e);
  }
  
  console.log(customer);
  
  if(!customer) return res.sendStatus(400);

  switch (webhookData.event) {
    case "PAYMENT_CREATED":
      //MANDAR EMAIL DE CONFIRMAÇÃO
      //isso aq
      /*sendNotification([customer.email], {
        title: "PAGAMENTO CRIADO!",
        message: "Cheque seus dados e realize o pagamento!",
      });*/
      //-->
      break;
    case "PAYMENT_CONFIRMED":
      //LIBERAR ACESSO AO SISTEMA E MANDAR EMAIL DE CONFIRMAÇÃO
      sendNotification([customer.email], {
        title: "PAGAMENTO CONFIRMADO!",
        message: "Você já pode utilizar a nossa plataforma a vontade!",
      });
      updateItem({
        path: `gestaoempresa/business/${customer.externalReference}/info`,
        params: {
          acessConnect: true,
          overdue: false
        }
      });
      //-->
      break;
    case "PAYMENT_RECEIVED":
      sendNotification([customer.email], {
        title: "PAGAMENTO RECEBIDO",
        message:
          "Você já pode utilizar a nossa plataforma a vontade!",
      });
      updateItem({
        path: `gestaoempresa/business/${customer.externalReference}/info`,
        params: {
          acessConnect: true,
          overdue: false
        }
      });
      break;
      case "PAYMENT_OVERDUE":
        //-->
        updateItem({
          path: `gestaoempresa/business/${customer.externalReference}/info`,
          params: {
            acessConnect: false,
            overdue: true,
          }
        });
        sendNotification([customer.email], {
          title: "PAGAMENTO ATRASADO!",
          message:
            "Fechamos seu acesso ao sistema devido a dívida. Pague para a liberação!",
        });
        break;
  }

  res.sendStatus(200);
});

module.exports = router;

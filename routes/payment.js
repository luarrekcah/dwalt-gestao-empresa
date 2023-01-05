const express = require("express"),
    router = express.Router();

    require("dotenv").config()

router.get("/", async (req, res, next) => {
    res.render("pages/payments");
});

router.post("/", async (req, res, next) => {
    const newCustomerHeaders = new Headers();
    newCustomerHeaders.append("Content-Type", "application/json");
    newCustomerHeaders.append("access_token", process.env.asaasApiKey);

    const raw = JSON.stringify({
        "name": "Marcelo Almeida",
        "email": "marcelo.almeida@gmail.com",
        "phone": "4738010919",
        "mobilePhone": "4799376637",
        "cpfCnpj": "24971563792",
        "postalCode": "01310-000",
        "address": "Av. Paulista",
        "addressNumber": "150",
        "complement": "Sala 201",
        "province": "Centro",
        "externalReference": "12987382",
        "notificationDisabled": false,
        "additionalEmails": "marcelo.almeida2@gmail.com,marcelo.almeida3@gmail.com",
        "municipalInscription": "46683695908",
        "stateInscription": "646681195275",
        "observations": "ótimo pagador, nenhum problema até o momento"
    });

    const requestOptions = {
        method: 'POST',
        headers: newCustomerHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(process.env.asaasDomain + "api/v3/customers", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
});

router.get("/assinatura", async (req, res, next) => {
    res.render("pages/payments/subscription");
});

router.post("/assinatura", async (req, res, next) => {
    console.log(req.body);

    res.sendStatus(200);
});

module.exports = router;
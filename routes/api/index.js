// /api/v1/

const express = require("express"),
  router = express.Router(),
  axios = require("axios");

const admin = require("firebase-admin");

const { getAllItems, getItems, updateItem } = require("../../database/users");

router.get("/", async (req, res, next) => {
  res.sendStatus(200);
});

router.get("/notification", async (req, res, next) => {
  res.sendStatus(400);
});

router.post("/notification", async (req, res, next) => {
  const { title, body, key, to, customer } = req.query;

  if (!title || !body || !key) return res.sendStatus(406);

  const tokens = [];

  if (customer) {
    const customerData = await getItems({
      path: `gestaoempresa/business/${key}/customers/${customer}`,
    });
    if (!customerData.token) return res.sendStatus(404);

    tokens.push(customerData.token);
  } else {
    if (!to) return res.sendStatus(406);

    if (to === "staffs") {
      const staffs = await getAllItems({
        path: `gestaoempresa/business/${key}/staffs`,
      });
      staffs.forEach((i) => {
        if (i.data.token) {
          tokens.push(i.data.token);
        }
      });
    } else {
      return res.sendStatus(406);
    }
  }

  if (tokens.length === 0) return res.sendStatus(404);

  await admin.messaging().sendMulticast({
    tokens,
    notification: {
      title,
      body,
    },
  });
  return res.sendStatus(201);
});

router.get("/cnpj/:cnpj", async (req, res, next) => {
  let { cnpj } = req.params;
  cnpj = cnpj.replace(/\D/g, "");

  axios
    .get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});


router.post("/updateSubscriptionValue", async (req, res, next) => {
  console.log(req.body);
  const business = await getItems({path: `gestaoempresa/business/${req.body.key}`})

  if(business.info.email !== 'contato@dlwalt.com') {
    return res.sendStatus(403)
  }

  updateItem({
    path: 'gestaoempresa/config',
    params: {
      subscriptionValue: Number(req.body.newValue)
    }
  })

  return res.sendStatus(200);
})

module.exports = router;

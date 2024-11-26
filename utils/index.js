const { getUser, createItem, getAllItems } = require("../database/users");
require("dotenv").config();

const axios = require("axios");

const moment = require("moment");

const URL = "https://www.asaas.com/api/v3";

module.exports = {
  subscriptionChecker: async (req) => {
    if (req.user === undefined) return { code: false, redirect: "/" };

    const user = await getUser({ userId: req.user.key });

    if (user.data.asaasID === "" || user.data.asaasID === undefined) {
      return { code: false, redirect: "/pagamento" };
    }

    if (
      user.data.subscriptionID === "" ||
      user.data.subscriptionID === undefined
    ) {
      return { code: false, redirect: "/pagamento/assinatura" };
    }

    if (
      (user.data.acessConnect === false ||
        user.data.acessConnect === undefined) &&
      !process.env.DEV
    ) {
      return {
        code: false,
        redirect: "/pagamento/erro?message=pending_subscription",
      };
    }

    const config = {
      method: "get",
      url: `${URL}/subscriptions/${user.data.subscriptionID}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
    };

    const response = await axios(config);

    if (process.env.DEV) {
      return { code: true, redirect: "/dashboard" };
    }

    if (response.data.deleted) {
      return {
        code: false,
        redirect: `/pagamento/erro?message=deleted_subscription`,
      };
    } else if (user.data.acessConnect && response.data.status === "ACTIVE") {
      return { code: true, redirect: "/dashboard" };
    } else {
      return {
        code: false,
        redirect: `/pagamento/erro?message=pending_subscription`,
      };
    }
  },
  createNotification: (title, body, key, to, customer = "") => {
    if (!title || !body || !key || !to) {
      return console.warn("Missing params");
    } else {
      const params = new URLSearchParams({
        title,
        body,
        key,
        to,
        customer,
      }).toString();

      axios
        .post(`https://connect.dwalt.net/api/v1/notification?${params}`)
        .then((r) => {
          console.log(r.data);
        });
    }
  },
  businessNotify: async (message, icon, style, to) => {
    if (!message || !icon || !style || !to) {
      return console.warn("Missing params");
    }

    if (to === "all") {
      const business = await getAllItems({ path: "gestaoempresa/business" });

      for (let index = 0; index < business.length; index++) {
        const b = business[index];

        try {
          createItem({
            path: `gestaoempresa/business/${b.key}/notifications`,
            params: {
              message,
              icon,
              style,
              createAt: moment().format(),
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      try {
        createItem({
          path: `gestaoempresa/business/${to}/notifications`,
          params: {
            message,
            icon,
            style,
            createAt: moment().format(),
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  },
};

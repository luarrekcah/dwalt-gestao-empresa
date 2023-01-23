const asaasAPI = require("node-asaas-api");
const { getUser } = require("../database/users");

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

asaasAPI.config(params);

module.exports = {
  subscriptionChecker: async (req) => {
    if (req.user === undefined) return false;
    const user = await getUser({ userId: req.user.key });
    const response = await asaasAPI.subscriptions.get(user.data.subscriptionID);
    if (
      user.data.subscriptionID === "" ||
      user.data.subscriptionID === undefined
    )
      return false;

    const okStatuses = ["ACTIVE", "CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"];

    if (response.data.deleted || !okStatuses.includes(response.data.status))
      return false;
    else if (
      !response.data.deleted &&
      okStatuses.includes(response.data.status)
    )
      return true;
    else return false;
  },
};

const admin = require("firebase-admin");
const { getItems, getAllItems } = require("../../../database/users");

async function get(req, res, next) {
    res.sendStatus(200);
}

async function sendNotify(req, res, next) {
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
}


module.exports = {
 get,
 sendNotify
};
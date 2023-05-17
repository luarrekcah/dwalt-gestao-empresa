
const { getAllItems, getUser } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    const logs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/logs` })
    user = await getUser({ userId: req.user.key })
     const  notifications = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/notifications`,
    })
    const data = {
        user,
        logs,
        message: null,
        notifications
    }
    res.render("pages/logs", data);
});

module.exports = router;
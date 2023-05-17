
const { getAllItems, getUser } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/growatt", async (req, res, next) => {
    const logs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}` })
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
    res.render("pages/inverters/growatt", data);
});

module.exports = router;
const { getAllItems, getUser, getItems } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    const projouts = await getAllItems({ path: `gestaoempresa/projouts` })
    user = await getUser({ userId: req.user.key }),
    bLength = await getAllItems({ path: `gestaoempresa/business` }),
    subscriptionValue = await getItems({path: 'gestaoempresa/config/subscriptionValue'})

    if(user.data.email !== 'contato@dlwalt.com') {
        return res.redirect("/dashboard")
    }

    const overview = {
        businessLength: bLength.length
    };

    const data = {
        user,
        projouts,
        message: null,
        overview,
        currentPage: res.locals.currentPage,
        subscriptionValue,
        allBusiness: bLength
    }
    res.render("pages/panel", data);
});

module.exports = router;
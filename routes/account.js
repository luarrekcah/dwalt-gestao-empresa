const express = require("express"),
    router = express.Router();

const { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares");
const { updateItem, getUser } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const user = await getUser({userId: req.user.key})
        const data = {
            user,
            message: null,
        };
        res.render("pages/profile", data);
    } else {
        res.redirect("/");
    }
});

router.post("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const { logoSrc, ownerName, mainLocation, phone } = req.body;
        console.log(req.body);
        updateItem({
            path: `gestaoempresa/business/${req.user.key}/info/profile`, params: {
                logo: logoSrc,
                ownerName,
                mainLocation,
                phone,
            }
        });
        return res.redirect("/conta");
    } else {
        return res.redirect("/");
    }
})


module.exports = router;
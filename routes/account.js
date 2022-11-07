const express = require("express"),
    router = express.Router();
    
const { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares");
const { updateItem, getAllItems } = require("../database/users");

router.get("/", (req, res, next) => {
    //const user = await getAllItems({path: `gestaoempresa/business/${req.user.key}`})
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/profile", data);
    } else {
        res.redirect("/");
    }
});

router.post("/", (req, res, next) => {
    const {logoSrc, ownerName, mainLocation, phone} = req.body;
    console.log(req.body);
    updateItem({path: `gestaoempresa/business/${req.user.key}/info/profile`, params: {
        logo: logoSrc,
        ownerName,
        mainLocation,
        phone,
    }});
    return res.redirect("/conta");
})


module.exports = router;
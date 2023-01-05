const express = require("express"),
    router = express.Router();

const { getStorage, uploadString, getDownloadURL, ref } = require("@firebase/storage");

const { updateItem, getUser } = require("../database/users");

router.get("/", async (req, res, next) => {
        const user = await getUser({ userId: req.user.key })
        const data = {
            user,
            message: null,
        };
        res.render("pages/profile", data);
   
});

router.post("/", (req, res, next) => {
        const storage = getStorage();
        const { logoSrc, ownerName, mainLocation, phone, about, tokenGrowatt } = req.body;
        console.log(req.body);
        if (logoSrc.includes('http')) {
            updateItem({
                path: `gestaoempresa/business/${req.user.key}/info/profile`, params: {
                    logo: logoSrc,
                    ownerName,
                    mainLocation,
                    phone,
                    about,
                }
            });
            updateItem({
                path: `gestaoempresa/business/${req.user.key}/info`, params: {
                    tokenGrowatt
                }
            });
            return res.redirect("/conta");
        } else {
            const storageRef = ref(storage, `gestaoempresa/business/${req.user.key}/info/profile/logo.png`);
            uploadString(storageRef, logoSrc, 'data_url').then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    updateItem({
                        path: `gestaoempresa/business/${req.user.key}/info/profile`, params: {
                            logo: downloadURL,
                            ownerName,
                            mainLocation,
                            phone,
                            about,
                        }
                    });
                    updateItem({
                        path: `gestaoempresa/business/${req.user.key}/info`, params: {
                            tokenGrowatt
                        }
                    });
                    return res.redirect("/conta");
                });
            });
        }
})


module.exports = router;
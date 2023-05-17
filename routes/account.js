const express = require("express"),
  router = express.Router();

const {
  getStorage,
  uploadString,
  getDownloadURL,
  ref,
} = require("@firebase/storage");

const { updateItem, getUser, deleteItem } = require("../database/users");
const { getSubscription, deleteSubscription } = require("../services/asaas");

router.get("/", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const { subscriptionID } = user.data;
  const subs = await getSubscription(subscriptionID);
  const  notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  })
  const data = {
    user,
    subs,
    message: null,
    notifications
  };
  res.render("pages/profile", data);
});

router.post("/", (req, res, next) => {
  const storage = getStorage();
  const { logoSrc, ownerName, mainLocation, phone, about, tokenGrowatt } =
    req.body;
  console.log(req.body);
  if (logoSrc.includes("http")) {
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info/profile`,
      params: {
        logo: logoSrc,
        ownerName,
        mainLocation,
        phone,
        about,
      },
    });
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/info`,
      params: {
        tokenGrowatt,
      },
    });
    return res.redirect("/conta");
  } else {
    const storageRef = ref(
      storage,
      `gestaoempresa/business/${req.user.key}/info/profile/logo.png`
    );
    uploadString(storageRef, logoSrc, "data_url").then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/info/profile`,
          params: {
            logo: downloadURL,
            ownerName,
            mainLocation,
            phone,
            about,
          },
        });
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/info`,
          params: {
            tokenGrowatt,
          },
        });
        return res.redirect("/conta");
      });
    });
  }
});

router.post("/cancelar_assinatura", async(req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const { subscriptionID } = user.data;
  if(user.overdue) {
    res.sendStatus(403);
  } else {
    const subs = await getSubscription(subscriptionID);
    await deleteSubscription(subs.id)
    deleteItem({path: `gestaoempresa/business/${user.key}/info/subscriptionID`})
    res.sendStatus(200);
  }
});

module.exports = router;

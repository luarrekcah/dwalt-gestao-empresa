const { getDate } = require("../auth/functions/database");

const express = require("express"),
  router = express.Router(),
  {
    deleteItem,
    getAllItems,
    getUser,
    getItems,
    createItem,
    createLogs,
    updateItem,
    setItem,
  } = require("../database/users");

const {
  ref,
  uploadString,
  getDownloadURL,
  getStorage,
} = require("@firebase/storage");

router.get("/", async (req, res, next) => {
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });
  const user = await getUser({ userId: req.user.key });
  const data = {
    user,
    customers,
    message: null,
  };
  res.render("pages/customers", data);
});

router.delete("/", (req, res, next) => {
  const id = req.body.id;
  deleteItem({
    path: `gestaoempresa/business/${req.user.key}/customers/${id}`,
  });
  res.sendStatus(200);
});

router.get("/adicionar", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const config = await getItems({
    path: `gestaoempresa/business/${req.user.key}/config`,
  });
  const data = {
    user,
    message: null,
    config,
  };
  res.render("pages/customers/new", data);
});

router.post("/adicionar", async (req, res, next) => {
  const customer = req.body;
  customer.createdAt = getDate();
  console.log(customer);
  createItem({
    path: `gestaoempresa/business/${customer.business}/customers`,
    params: customer,
  });
  createLogs(
    req.user.key,
    `Cliente ${customer.nomeComp || customer.nomeFantasia} registrado.`
  );
  return res.redirect("/dashboard/clientes?message=registrado");
});

router.get("/visualizar/:id", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });

  const photos =
    (await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/photos`,
    })) || [];
  const customer = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}`,
  });
  let message = null;

  const data = {
    user,
    customer,
    message,
    photos,
  };
  res.render("pages/customers/see", data);
});

router.post("/visualizar/:id", async (req, res, next) => {
  const storage = getStorage();
  const data = req.body;
  switch (data.type) {
    case "ADD_PHOTO":
      const receivedData = JSON.parse(data.documentBase64);
      for (const image of receivedData) {
        const path = `gestaoempresa/business/${req.user.key}/customers/${
          req.params.id
        }/photos/${new Date().getTime()}.jpg`;
        const storageRef = ref(storage, path);
        try {
          uploadString(storageRef, image, "data_url").then((snapshot) => {
            console.log(snapshot);
            getDownloadURL(snapshot.ref).then((downloadURL) => {
              console.log(downloadURL);
              console.log(
                `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/photos`
              );
              createItem({
                path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/photos`,
                params: {
                  path,
                  url: downloadURL,
                },
              });
            });
          });
        } catch (error) {
          console.log(error);
        }
      }
      createLogs(req.user.key, "Imagens adicionadas para um cliente.");
      break;
  }

  return res.redirect(`/dashboard/clientes/visualizar/${req.params.id}`);
});

router.get("/editar/:id", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const customer = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}`,
  });
  let message = null;

  const data = {
    user,
    customer,
    message,
  };
  res.render("pages/customers/edit", data);
});

router.post("/editar/:id", async (req, res, next) => {
  updateItem({
    path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}`,
    params: req.body,
  });
  createLogs(req.user.key, "Cliente atualizado.");
  return res.redirect(
    "/dashboard/clientes/visualizar/" + req.params.id + "?message=editado"
  );
});

router.get("/checkExist/:cpf_cnpj", async (req, res, next) => {
  let { cpf_cnpj } = req.params;
  cpf_cnpj = cpf_cnpj.replace(/\D/g, "");
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });
  const finded = customers.find((i) => {
    if (i.data.cpf && i.data.cpf.replace(/\D/g, "") === cpf_cnpj) {
      return i;
    } else if (i.data.cnpj && i.data.cnpj.replace(/\D/g, "") === cpf_cnpj) {
      return i;
    } else {
      return;
    }
  });
  if (finded)
    return res.json({
      error: true,
      message: "user found",
    });
  else
    return res.json({
      error: false,
      message: "user not found",
    });
});

module.exports = router;

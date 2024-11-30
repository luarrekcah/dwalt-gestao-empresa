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
  deleteObject,
} = require("@firebase/storage");

router.get("/", async (req, res, next) => {
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });
  const user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });

  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "registrado":
        message = {
          type: "success",
          title: "Cliente Registrado!",
          description:
            "Deseja criar um projeto para o cliente?",
          buttons: [
            { text: "Adicionar Projeto", link: "/dashboard/projetos/adicionar" }
          ]
        };
        break;
    }
  } else {
    message = null;
  }


  const data = {
    user,
    customers,
    message,
    currentPage: res.locals.currentPage,
    notifications,
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
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const data = {
    user,
    message: null,
    config,
    notifications,
  };
  res.render("pages/customers/new", data);
});

router.post("/adicionar", async (req, res, next) => {
  try {

    const storage = getStorage();
    const customer = req.body;
    customer.createdAt = getDate();

    let documents = [];
    if (customer.base64Documents) {
      documents = JSON.parse(customer.base64Documents);
      delete customer.base64Documents;
    }

    const key = await createItem({
      path: `gestaoempresa/business/${customer.business}/customers`,
      params: customer,
    });

    for (const doc of documents) {
      try {
        const match = doc.match(/^data:(.*?);base64,/);

        if (!match || match.length < 2) {
          throw new Error("Formato de base64 inválido");
        }

        const mimeType = match[1];
        const extension = mimeType.split("/")[1];

        const path = `gestaoempresa/business/${req.user.key}/customers/${key}/docs/${new Date().getTime()}.${extension}`;
        const storageRef = ref(storage, path);

        const base64Data = doc.replace(/^data:.*;base64,/, "");

        await uploadString(storageRef, base64Data, "base64").then((snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            createItem({
              path: `gestaoempresa/business/${req.user.key}/customers/${key}/docs`,
              params: {
                path,
                url: downloadURL,
              },
            });
          });
        });
      } catch (error) {
        console.log("Erro ao processar documento:", error);
      }
    }

    createLogs(
      req.user.key,
      `Cliente ${customer.nomeComp || customer.nomeFantasia} registrado.`
    );

    return res.redirect("/dashboard/clientes?message=registrado");
  } catch (error) {
    console.log(error);
    return res.redirect("/dashboard/clientes?message=error");
  }
});

router.get("/visualizar/:id", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const docs =
    (await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/docs`,
    })) || [];
  const customer = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}`,
  });
  let message = null;

  console.log(docs);

  const data = {
    user,
    customer,
    message,
    photos: docs,
    notifications,
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
        try {
          // Extraindo a extensão do arquivo do base64
          const match = image.match(/^data:(.*?);base64,/);
          if (!match || match.length < 2) {
            throw new Error("Formato de base64 inválido");
          }
          const mimeType = match[1];
          const extension = mimeType.split("/")[1]; // Ex.: image/png -> png

          // Definindo o caminho do arquivo com a extensão correta
          const path = `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/docs/${new Date().getTime()}.${extension}`;
          const storageRef = ref(storage, path);

          // Removendo o prefixo base64 antes de enviar para o Firebase
          const base64Data = image.replace(/^data:.*;base64,/, "");

          await uploadString(storageRef, base64Data, "base64").then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
              createItem({
                path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}/docs`,
                params: {
                  path,
                  url: downloadURL,
                },
              });
            });
          });
        } catch (error) {
          console.log("Erro ao processar imagem:", error);
        }
      }

      // Criando log de ação
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
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });

  const data = {
    user,
    customer,
    message,
    notifications,
  };
  res.render("pages/customers/edit", data);
});

router.post("/editar/:id", async (req, res, next) => {
  console.log(req.body)
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

router.delete("/deletedoc", async (req, res, next) => {
  try {
    const storage = getStorage();
    const filePath = req.query.path;


    if (!filePath) {
      return res.status(400).send({ message: "Caminho do arquivo não fornecido." });
    }

    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);

    const pathSegments = filePath.split("/"); // Ex.: gestaoempresa/business/{user}/customers/{id}/docs/{file}
    const customerId = pathSegments[4]; 
    const docPath = `gestaoempresa/business/${pathSegments[2]}/customers/${customerId}/docs`;

    const alldocs = await getAllItems({path: docPath});

    const docToDel = alldocs.find(dc => dc.data.path === filePath);

    await deleteItem({
      path: `${docPath}/${docToDel.key}`,
    });

    createLogs(req.user.key, `Documento removido para o cliente ${customerId}.`);

    return res.status(200).send({ message: "Documento removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return res.status(500).send({ message: "Erro ao deletar documento." });
  }
});

module.exports = router;

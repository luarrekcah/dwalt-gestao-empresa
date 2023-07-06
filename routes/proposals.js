const express = require("express");
const router = express.Router();
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fetch = require('node-fetch');
const multer = require("multer");

const {
  getAllItems,
  getUser,
  createLogs,
  getItems,
  updateItem,
  createItem,
  uploadFile,
  deleteItem,
} = require("../database/users");

const upload = multer({ dest: "uploads/" });

function generateDocx(data, buffer) {
  const zip = new PizZip(buffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buf.toString("base64");
}

router.get("/", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/logs`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const proposals = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/proposals/all`,
  });
  const docxBase64 = await getItems({
    path: `gestaoempresa/business/${req.user.key}/proposals/config/file`,
  });
  const data = {
    user,
    logs,
    message: null,
    notifications,
    proposals,
    docxBase64,
  };
  res.render("pages/proposals", data);
});


router.delete("/", async (req, res, next) => {
  const propKey = req.query.key;
  try {
    deleteItem({path: `gestaoempresa/business/${req.user.key}/proposals/all/${propKey}`})
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});


router.get("/docs", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/logs`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const data = {
    user,
    logs,
    message: null,
    notifications,
  };
  res.render("pages/proposals/docs", data);
});


router.post("/", async (req, res, next) => {
  const fileBase64 = req.body.fileContent;

  const url = await uploadFile({
    path: `gestaoempresa/business/${req.user.key}/proposals/${Date.now()}.docx`,
    base64: fileBase64,
  });

  try {
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/proposals/config`,
      params: {
        file: url,
      },
    });

    createLogs(req.user.key, `Template de proposta alterado.`);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.get("/nova", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/logs`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });

  const allProposals = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/proposals/all`,
  });

  function gerarIdentificadorProposta(numPropostas) {
    numPropostas++;
    const identificador = numPropostas.toString().padStart(6, "0");
    return identificador;
  }

  const data = {
    user,
    logs,
    customers,
    message: null,
    notifications,
    identifyNumber: gerarIdentificadorProposta(allProposals.length),
  };
  res.render("pages/proposals/new", data);
});


router.post("/generate", async (req, res, next) => {
  const propKey = req.query.key;
 
  if(!propKey) {
    return res.sendStatus(400);
  }

  const data = await getItems({path: `gestaoempresa/business/${req.user.key}/proposals/all/${propKey}`})

  const docxUrl = await getItems({
    path: `gestaoempresa/business/${req.user.key}/proposals/config/file`,
  });

  if (typeof docxUrl === "string") {
    const response = await fetch(docxUrl);
    const buffer = await response.buffer();
    const base64Docx = generateDocx(data, buffer);
    const fileName = `PROPOSTA-${propKey}.docx`;
    const fileBuffer = Buffer.from(base64Docx, "base64");
    res.set("Content-Disposition", `attachment; filename="${fileName}"`);
    res.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(fileBuffer);
  } else {
    return res.sendStatus(404);
  }

});

router.post("/nova", async (req, res, next) => {
  const data = req.body;
  console.log('dados:', data);

  const customer = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${data.customerID}`
  });

  const dateAct = new Date();

  let dia = dateAct.getDate();
  let mes = dateAct.getMonth() + 1;
  const ano = dateAct.getFullYear();

  if (dia < 10) {
    dia = "0" + dia;
  }

  if (mes < 10) {
    mes = "0" + mes;
  }

  data.criadoEm = dia + "/" + mes + "/" + ano;

  data.cpf_cnpj = data.customerID !== "Geral" ? customer.cpf || customer.cnpj : 'SEM DOCUMENTO';
  data.nome_cliente = data.customerID !== "Geral" ? customer.nomeComp || customer.nomeFantasia : 'Geral';
  data.kwAno = Number(data.kwMes) * 12

  const docxUrl = await getItems({
    path: `gestaoempresa/business/${req.user.key}/proposals/config/file`,
  });

  createItem({
    path: `gestaoempresa/business/${req.user.key}/proposals/all`,
    params: data,
  });

  if (typeof docxUrl === "string") {
    const response = await fetch(docxUrl);
    const buffer = await response.buffer();
    const base64Docx = generateDocx(data, buffer);
    const fileName = `PROPOSTA-${data.proposalID}.docx`;
    const fileBuffer = Buffer.from(base64Docx, "base64");
    res.set("Content-Disposition", `attachment; filename="${fileName}"`);
    res.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(fileBuffer);
  } else {
    return res.sendStatus(404);
  }
});

module.exports = router;

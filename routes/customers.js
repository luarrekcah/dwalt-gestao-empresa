const { getDate } = require("../auth/functions/database");

const express = require("express"),
    router = express.Router(),
    
    { deleteItem, getAllItems, getUser, getItems, createItem, createLogs, updateItem } = require("../database/users");

router.get("/", async (req, res, next) => {
   
        const customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` })
        const user = await getUser({ userId: req.user.key })
        const data = {
            user,
            customers,
            message: null,
        };
        res.render("pages/customers", data);
 
});

router.delete("/", (req, res, next) => {
    const id = req.body.id;
    deleteItem({ path: `gestaoempresa/business/${req.user.key}/customers/${id}` })
    res.sendStatus(200);
});

router.get("/adicionar", async (req, res, next) => {
        const user = await getUser({ userId: req.user.key })
        const config = await getItems({ path: `gestaoempresa/business/${req.user.key}/config` });
        const data = {
            user,
            message: null,
            config,
        };
        res.render("pages/customers/new", data);
  
});

router.post("/adicionar", async (req, res, next) => {
    
    console.log(req.body);
    const customer = req.body;
    customer.createdAt = getDate();
    createItem({ path: `gestaoempresa/business/${customer.business}/customers`, params: customer });
    createLogs(req.user.key, `Cliente ${customer.nomeComp} registrado.`);
    return res.redirect("/dashboard/clientes?message=registrado");
});


router.get("/visualizar/:id", async (req, res, next) => {
    
    const user = await getUser({ userId: req.user.key })
    const customer = await getItems({ path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}` });
    let message = null

    const data = {
        user,
        customer,
        message,
    };
    res.render("pages/customers/see", data);
});


router.get("/editar/:id", async (req, res, next) => {
    
    const user = await getUser({ userId: req.user.key })
    const customer = await getItems({ path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}` });
    let message = null

    const data = {
        user,
        customer,
        message,
    };
    res.render("pages/customers/edit", data);
});

router.post("/editar/:id", async (req, res, next) => {
    
    updateItem({ path: `gestaoempresa/business/${req.user.key}/customers/${req.params.id}`, params: req.body });
    createLogs(req.user.key, "Cliente atualizado.");
    return res.redirect("/dashboard/clientes/visualizar/" + req.params.id + "?message=editado");
})

module.exports = router;
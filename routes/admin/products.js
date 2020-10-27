const express = require("express");
const { validationResult } = require("express-validator");
const multer = require('multer');
const products = require("../../repositories/products");

const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const { requireTitle, requirePrice } = require("./validators");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()}); //destination of the files that are being uploaded

router.get("/admin/products", (req, res) => {});

router.get("/admin/products/new", (req, res) => {
  res.send(productsNewTemplate({}));
});

router.post("/admin/products/new", upload.single('image'), [requireTitle, requirePrice], async(req, res) => {
  const errors = validationResult(req); //get out of the requests only the errors
  if(!errors.isEmpty()){
    res.send(productsNewTemplate({errors}));
  }
  const image = req.file.buffer.toString('base64');
  const {title, price} = req.body;
  const product = await productsRepo.create({title, price, image});
  res.send("Submitted");
});

module.exports = router;

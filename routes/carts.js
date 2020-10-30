const express = require("express");
const cartsRepo = require("../repositories/cart");
const productRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

//receive a post request to add an item to a cart
router.post("/cart/products", async (req, res) =>{
    let cart;
    if(!req.session.cartId){
        //we don't have a cart, we need to create one
        cart = await cartsRepo.create({items: []}); //defaulting the items property as an empty array
        //and store the cart id in the req.session.cartId property
        req.session.cartId = cart.id;
    } else {
        //we have a cart, let's get it from the repository
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    const existingItem = cart.items.find(item => {
        return item.id === req.body.productId;
    });
    //either incrementing quantity for existing products
    if(existingItem){
        existingItem.quantity++;
    } else {
        //or add new product to items array
        cart.items.push({id: req.body.productId, quantity: 1});
    }
    //save the cart
    await cartsRepo.update(cart.id, {
        items: cart.items
    });
    res.redirect("/cart");
})
//receive a get request to show all items in a cart
router.get("/cart", async (req, res) => {
    if(!req.session.cartId){
        return res.redirect("/");
    }
    const cart = await cartsRepo.getOne(req.session.cartId);
    for(let item of cart.items){
        const product = await productRepo.getOne(item.id);
        item.product = product;
    }
    res.send(cartShowTemplate({items: cart.items}));
});

//receive a post request to delete an item from a cart
router.post("/cart/products/delete", async(req, res) => {
    const {itemId} = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);
    const items = cart.items.filter(item => {
        return item.id !== itemId;
    });//return true if item.id is not equal to itemId
    await cartsRepo.update(req.session.cartId, {items});
    res.redirect("/cart");
})

module.exports = router; 
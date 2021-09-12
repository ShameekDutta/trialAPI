const { json } = require('body-parser');
const express = require('express');
const routes = express.Router();

const userController = require('../user/controller');

routes.post('/getServices', userController.getServices)
routes.post('/getSlotByDate', userController.getSlotByDate)
routes.post('/addToCart', userController.addToCart)
routes.get('/preOrder', userController.preOrder)
routes.get('/placeOrder', userController.placeOrder)

module.exports = routes;
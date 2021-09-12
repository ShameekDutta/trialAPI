const { json } = require('body-parser');
const express = require('express');
const routes = express.Router();

const vendorController = require('../vendor/controller');

routes.post('/addServices', vendorController.addService);
routes.post('/addPricesAndAvailability', vendorController.addPriceAndAvailability);
routes.get('/getServices', vendorController.getService);
routes.post('/addTimeSlot',vendorController.addTimeSlot);
routes.post('/register',vendorController.register);

module.exports = routes;
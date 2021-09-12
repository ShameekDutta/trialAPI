const vendorServices=require('./service')

var vendorController = {
    register: async function(req, res) {
        try {
            var result = null;
            if(req.body.userType == 'user') {
                result = await vendorServices.registerUser(req)
            } else {
                result = await vendorServices.registerVendor(req)
            }
            res.status(200).json(result)
        } catch(ex) {
            console.log(ex);
            res.sendStatus(500)
        }
    },
    addService: async function(req, res) {
        try {
            var result = await vendorServices.addService(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    getService: async function(req, res) {
        try {
            var result = await vendorServices.getService(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    addPriceAndAvailability: async function(req, res) {
        try {
            var result = await vendorServices.addPricesAndAvailability(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    addTimeSlot: async function(req, res) {
        try {
            var result = await vendorServices.addTimeSlot(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

module.exports = vendorController;
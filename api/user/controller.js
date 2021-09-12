const userServices=require('./service')

var userController = {
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
    getServices: async function(req, res) {
        try {
            var result = await userService.getService(req);
            res.status(200).json(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    addToCart: async function(req, res) {
        try {
            var result = await userService.addToCart(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    preOrder: async function(req, res) {
        try {
            var result = await userService.getPreOrder(req);
            res.status(200).json(result);
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    placeOrder: async function(req, res) {
        try {
            var result = await userService.placeOrder(req);
            res.status(200).json(result) 
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}
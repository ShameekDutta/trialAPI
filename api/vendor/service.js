const ServiceModel = require('../models/services')
const TimeSlots = require('../models/timeSlot')
const Vendor = require('../models/Vendor')
const Profile = require('../models/profile')

var vendorServices = {
    registerVendor: async function(req) {
        try {

            const {email, password, firstName, lastName, DOB, contactNo } = req.body;
        
            const vendorAlreadyExist = await Vendor.exists({email});
            if(vendorAlreadyExist) return {"message":'failure',"status": "200","message1": "email is not registered"};
            const vendor = new Vendor({email, password})
            await vendor.save()

            var profData = new Profile({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                userId: vendor._id
            })

            await profData.save()

            // const JWT_TOKEN = utils.generateAccessToken({id: vendor._id, email: vendor.email, userType: req.body.userType })

            return true;

        } catch(error) {
            console.log(error)
            return false;
        }
    },
    addService: async function(req) {
        try {
            var { title, name, description, images, activity_type, categories, timeBased, addressDetail, amenities, contactInfo } = req.body;
            const vendor = {
                "_id" : "613cb497b06ee9eaf7e81219",
                "email" : "testvendor1@email.com",
                "password" : "$2b$04$fq7W0RtUL.vgZMFc.AHOjeJxKIDCvh8WLUU958d8hQGSxLZEfoLdi",
                "socialLogin" : false,
                "__v" : 0
            };
            
            var priceCat = []
            var pricesForService = []
            if(categories.length > 0){
                categories.forEach(cat => {
                    priceCat.push({category: cat.category})
                    pricesForService.push({category: cat.prices})
                })
            }

            var data = {
                title, 
                name, 
                description, 
                images, 
                activity_type, 
                categories: priceCat, 
                vendorId: vendor._id, 
                timeBased, 
                addressDetail,
                amenities,
                contactInfo
               }

            const service = new ServiceModel(data);
            const serviceSave = await service.save();
            if(serviceSave) {
                return {
                    status: true
                }
            }
            return {
                status: false
            }
        } catch(error) {
            console.log(error);
            return null;
        }
    },
    getService: async function(req) {
        try {
            const vendor = {
                "_id" : "613cb497b06ee9eaf7e81219",
                "email" : "testvendor1@email.com",
                "password" : "$2b$04$fq7W0RtUL.vgZMFc.AHOjeJxKIDCvh8WLUU958d8hQGSxLZEfoLdi",
                "socialLogin" : false,
                "__v" : 0
            };
            const serviceId=req.query.serviceId;
            const vendorId=vendor._id;

            if(serviceId) {
                console.log({vendorId: vendor.id, _id: serviceId});
                const serviceData = await ServiceModel.findOne({vendorId: vendorId, _id: serviceId}, '-vendorId')
                if(!serviceData) return 'service does not exist';
                return serviceData;
            }
        } catch(error) {
            console.log(error)
            return;
        }
    },
    addPricesAndAvailability: async function(req) {
        try{
            const vendor =  {
                "_id" : "613cb497b06ee9eaf7e81219",
                "email" : "testvendor1@email.com",
                "password" : "$2b$04$fq7W0RtUL.vgZMFc.AHOjeJxKIDCvh8WLUU958d8hQGSxLZEfoLdi",
                "socialLogin" : false,
                "__v" : 0
            };
            const { serviceId, categoryId, prices} = req.body;

            const query = {_id: serviceId, vendorId: vendor._id, 'categories._id': categoryId};
            console.log(query);
            const updatePrice = await ServiceModel.updateOne(query,
            { $push: {
                'categories.$.prices': {$each: prices}
            }})
            console.log(updatePrice)
            if(updatePrice.n && updatePrice.nModified) {
                return {
                    status: true,
                }
            } else {
                return { status: false}
            }
        } catch(error) {
            console.log(error);
            return {status: false}
        }
    },
    addTimeSlot: async function(req) {
        try {
            const vendor = {
                "_id" : "613cb497b06ee9eaf7e81219",
                "email" : "testvendor1@email.com",
                "password" : "$2b$04$fq7W0RtUL.vgZMFc.AHOjeJxKIDCvh8WLUU958d8hQGSxLZEfoLdi",
                "socialLogin" : false,
                "__v" : 0
            };
            const { serviceId, categoryId, priceId, timeSlots} = req.body;

            const serviceData = await ServiceModel.findOne({_id: serviceId, vendorId: vendor._id}).lean();
            var catExist = false;
            var priceIdExist = false;
            serviceData.categories.forEach(cat => {
                if(cat._id == categoryId) {
                    catExist = true;
                    cat.prices.forEach(price => {
                        if(price._id == priceId) {
                            priceIdExist = true;
                            return;
                        }
                    })
                    return;
                }
            })
            if(!catExist) return 'Category does not exist';
            if(!priceIdExist) return 'PriceId does not exist';

            var dateObj = [];

            timeSlots.forEach(timeSlot => {
                var date = timeSlot.date.split('/')
                timeSlot.date = new Date(Date.UTC(Number(date[2]),Number(date[1]) - 1, Number(date[0])))
                dateObj.push( {'timeSlots.date': timeSlot.date})
            })

            var query = { priceId: priceId},
            update = { timeSlots: timeSlots},
            options = { upsert: true, new: true, setDefaultOnInsert: true};

            const timeSlotUpdate = await TimeSlots.findOneAndUpdate(query, update, options);

            return timeSlotUpdate;
        } catch (error) {
            console.log(error);
            return;
        }
    }
}

module.exports = vendorServices;
const Vendor = require('../models/Vendor')
const Profile = require('../models/profile')

var userServices = {
    registerUser: async function(req) {
        try {

            const {email, password, firstName, lastName, DOB, contactNo } = req.body;
        
            const userAlreadyExist = await User.exists({email});
            if(userAlreadyExist) return {"message":'failure',"status": "200","message1": "email is not registered"};
            const user = new User({email, password})
            await user.save()

            var profData = new Profile({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                userId: user._id
            })

            await profData.save()

            // const JWT_TOKEN = utils.generateAccessToken({id: vendor._id, email: vendor.email, userType: req.body.userType })

            return true;

        } catch(error) {
            console.log(error)
            return false;
        }
    },
    getService: async function (req) {
        try {
            const user ={};
            const serviceId = req.query.serviceId;

            let page = parseInt(req.query.page);
            const perPageCount = 10;

            const serviceCount = await ServiceModel.countDocuments({
                status: "Active",
            });

            const pageCount = Math.ceil(serviceCount / perPageCount);
            if (!page) {
                page = 1;
            }
            if (page > pageCount) {
                return {
                    totalServices: 0,
                    pageCount,
                    serviceList: [],
                };
            }
            var options = {
                status: "Active",
            };
            const filters = req.body.filter;
            var activityArray = [];

            if (filters) {
                const activityType = filters.activityType;

                if (activityType.length > 0) {
                    activityType.forEach((activity) => {
                        activityArray.push({activity_type: activity});
                    });
                    options.$or = activityArray;
                }

            }
            if (serviceId) {
                options._id = serviceId;
            }
            var serviceList = null;
            if (req.query.qs) {
                var searchText = req.query.qs;
                serviceList = await ServiceModel.find(
                    {
                        $or: [
                            {name: {$regex: searchText}},
                            {title: {$regex: searchText}},
                            {description: {$regex: searchText}},
                        ],
                    },
                    {vendorId: 0},
                    {skip: (page - 1) * perPageCount, limit: perPageCount}
                ).lean();
            } else {
                console.log(options);
                serviceList = await ServiceModel.find(options, {vendorId: 0}, {
                    skip: (page - 1) * perPageCount,
                    limit: perPageCount
                });
            }

            var formatData = await commonUtil.formatGetService(serviceList, req);

            formatData.forEach(service => {
                var minOccupancy = 999999;
                service.categories.forEach(cat => {
                    cat.prices.forEach(price => {
                        if (price.minPersonCount < minOccupancy) {
                            minOccupancy = price.minPersonCount
                        }
                    })
                })
                service.minPerson = minOccupancy;
            })

            if (req.body.priceRange) {
                formatData = formatData.filter((service) => {
                    var minPrice = util.getMinPriceService(service);
                    service.minPrice = minPrice;
                    var maxPrice = util.getMaxPriceService(service);
                    if (
                        minPrice >= req.body.priceRange.min &&
                        maxPrice <= req.body.priceRange.max
                    ) {
                        return true;
                    }
                });
            } else {
                formatData.forEach((service) => {
                    var minPrice = util.getMinPriceService(service);
                    service.minPrice = minPrice;
                });
            }
            if (req.body.distanceRange) {
                formatData = formatData.filter((service) => {
                    var distance = service.distance;

                    if (!service.distance) return true;
                    if (
                        distance >= req.body.distanceRange.min &&
                        distance <= req.body.distanceRange.max
                    ) {
                        return true;
                    }
                });
            }
            if (req.body.userLocation || req.body.sort && req.body.sort.by == "Distance") {
                if (req.body.sort && req.body.sort.sorting == "Descending") {
                    formatData.sort((a, b) =>
                        a.distance > b.distance ? -1 : b.distance > a.distance ? 1 : 0
                    );
                } else {
                    formatData.sort((a, b) =>
                        a.distance > b.distance ? 1 : b.distance > a.distance ? -1 : 0
                    );
                }
            }
            if (!req.body.userLocation || req.body.sort && req.body.sort.by == "Title") {

                if (req.body.sort && req.body.sort.sorting == "Descending") {
                    formatData.sort((a, b) =>
                        a.title > b.title ? -1 : b.title > a.title ? 1 : 0
                    );
                } else {
                    formatData.sort((a, b) =>
                        a.title > b.title ? 1 : b.title > a.title ? -1 : 0
                    );
                }
            }

            if (req.body.sort && req.body.sort.by == "Rating") {
                formatData.sort((a, b) => {
                    if (req.body.sort.sorting == "Ascending") {
                        return b.avgRating - a.avgRating;
                    }
                    if (req.body.sort.sorting == "Descending") {
                        return a.avgRating - b.avgRating;
                    }
                });
            }

            if (req.body.sort && req.body.sort.by == "Price") {
                if (req.body.sort.sorting == "Ascending") {
                    formatData.sort((a, b) => {
                        var aMinPrice = util.getMinPriceService(a);
                        var bMinPrice = util.getMinPriceService(b);
                        if (aMinPrice > bMinPrice) return -1;
                        else if (bMinPrice > aMinPrice) return 1;
                        return 0;
                    });
                }
                if (req.body.sort.sorting == "Descending") {
                    formatData.sort((a, b) => {
                        var aMinPrice = util.getMinPriceService(a);
                        var bMinPrice = util.getMinPriceService(b);
                        console.log(aMinPrice + "  " + bMinPrice);
                        if (aMinPrice > bMinPrice) return 1;
                        else if (bMinPrice > aMinPrice) return -1;
                        return 0;
                    });
                }
            }

            return commonUtil.responseDataV2('success', 200, null, formatData);
        } catch (error) {
            console.log(error);
            return commonUtil.responseDataV2('failure', 500);
        }
    },
    getSlotByDate: async function (req) {
        try {

            const {serviceId, categoryId, priceId, date} = req.body;

            console.log(date);
            var startDate = {
                day: date.day || 1,
                month: date.month - 1 || 1,
                year: date.year || 2021
            }

            var endDate = {
                day: date.day || 31,
                month: date.month - 1 || 11,
                year: date.year || 2021
            }
            var start = new Date(Date.UTC(startDate.year, startDate.month, startDate.day))
            var end = new Date(Date.UTC(endDate.year, endDate.month, endDate.day))

            console.log(startDate, endDate);
            var slot_data = await commonUtil.getSlotByDate(start, end, priceId)

            return commonUtil.responseDataV2('success', 200, null, slot_data);

        } catch (error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500);
            ;
        }
    }
}
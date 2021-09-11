const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = mongoose.Schema({
    address: String,
    street: String,
    city: String
}, {_id: false})

const categorySchema = mongoose.Schema({
    category: String,
    prices: [{
        title: String,
        amount: Number,
    }]
})

const ServiceSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    images: [{
        url: {
            type: String,
            trim: true
        },
        pin: Boolean
    }, {_id: false}],
    activity_type: [{
        type: String
    }],
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    categories: [categorySchema],
    addressDetail: AddressSchema,
    timeBased: {type: Boolean},
    status: {
        type: String,
        required: true,
        default: 'Active',
        enum: ['Active', 'Inactive']
    },
    amenities: [{
        type: String
    }],
    contactInfo: String
}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

const TimeSlotsSchema = new Schema({
    priceId: String,
    timeSlots: [{
        _id: false,
        date: Date,
        slots: [{
            from: String,
            to: String,
            availability: Number,
            minPersonCount: Number
        }]
    }]
}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
}, {_id: false});

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true
    },
    category: String,
    timeSlotId: {
        type: Schema.Types.ObjectId,
        ref: 'TimeSlots',
        required: true
    },
    priceType: String,
    amount: Number,
    quantity: {
        type: Number
    },
    totalAmount: Number
});

const OrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true
    },
    timeSlotId: {
        type: Schema.Types.ObjectId,
        ref: 'TimeSlots',
        required: true
    },
    quantity: {
        type: Number
    },
    transactionStatus: {
        type: String
    },
    orderStatus: {
        type: String
    },
    orderId: {
        type: Number
    },
    transactionId: Number,
    totalPrice: Number,
    price: Number

}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
})

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        minlength: 7,
        required: true
    },
    socialLogin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

UserSchema.pre('save', function(next) {

    const user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(4, function(err, salt) {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();

        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Services', ServiceSchema);
module.exports = mongoose.model('TimeSlots', TimeSlotsSchema);
module.exports = mongoose.model('Carts', CartSchema);
module.exports = mongoose.model('Orders', OrderSchema);
module.exports = mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Vendors', UserSchema);
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = express('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const vendorAuth = require('./api/routes/vendorAuth');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 1 * 60 * 1000, // Close sockets after 45 seconds of inactivity
    family: 4
};

mongoose.connect(
    'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000',options
);
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Origin','PUT, POST,PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/vendor', vendorAuth);

app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message:error.message
        }
    });
});

module.exports = app;
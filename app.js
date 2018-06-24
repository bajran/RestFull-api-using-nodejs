const express = require('express');
const app = express();
//To take the log details information when user hit any url
const morgan = require('morgan');
//To parse incoming request body
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

//Connection of Mongoose
mongoose.connect('mongodb://localhost:27017/test');

//Database Connection
mongoose.connection.on('connected',()=>{
    console.log("Database connection successfull");
})


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Rote Handle The Request
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

//If no routes found then it goes directly here
app.use((req, res, next)=>{
    const error = new Error('Not found');
    error.status= 404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message : error.message
        }
    });
});


module.exports = app; 
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');



router.get('/', (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .populate('product', 'name')
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                "details": "Details of All Orders",
                count: result.length,
                orders: result.map(order => {
                    return {
                        _id: order._id,
                        product: order.product,
                        quantity: order.quantity,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/orders/" + order._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});


router.post('/',checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if(!product){
                return res.status(500).json({
                    message: "Product is not availabel"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId,
            });
            return order.save();
           }
        )
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Product Stored Successfully",
                createdProduct: {
                    _id: result._id,
                    quantity: result.quantity,
                    product: result.product
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(501).json({
                message: "Product with id not availabel",
                error: err
            })
        });
});

router.get('/:orderId',checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
            .populate('product')
           .exec()
           .then(result=>{
               res.status(200).json({
                   result : result,
                   request :{
                       type : "GET",
                       url : "http://localhost:3000/orders"
                   }
               })
           })
           .catch(err => {
               console.log(err);
                res.status(500).json({
                    error : err
                })
           })
});


router.delete('/:orderId',checkAuth, (req, res, next) => {
    
    var id = req.params.orderId;
    Order.deleteOne({_id : id})
            .exec()
            .then(result =>{
                console.log(result);
                res.status(200).json({
                    message: "Order Deleted Successfully",
                    request:{
                        type: "POST",
                        description: "To add the nw order below is the link",
                        url: "http://localhost:3000/orders/"

                    }
                });
            })
            .catch(err=>{
                console.log(err);
                res.status(404).json({
                    error : err
                })
            })
});

module.exports = router;
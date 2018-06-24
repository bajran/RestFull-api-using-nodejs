const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().getDate() + file.originalname);
    }
});

const fileFilter=(req, file, cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: storage, 
    limits :{
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/',(req,res, next)=>{
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(result => {
            const response = {
                details : "Details of All Products",
                count : result.length,
                products: result.map(result =>{
                    return{
                        name: result.name,
                        price: result.price,
                        _id: result._id,
                        request:{
                            type: "GET",
                            url : "http://localhost:3000/products/" + result._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            });
        })
   
});


router.post('/', upload.single('productImage'), checkAuth, (req,res, next)=>{
 
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result =>{
        console.log(result);
        res.status(201).json({
            message : 'Created Product Suucessfully',
            createdProduct : {
                name : result.name,
                price : result.price,
                _id : result._id,
                request:{
                    type: "GET",
                    url: "http://localhost:3000/products/" + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
    
});


router.get('/:productId',(req,res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc=>{
            if(doc){
            res.status(200).json({
                product : doc,
                request :{
                    type : "GET",
                    description: "Get_All_Products_Details",
                    url: "http://localhost/3000/products"
                }
            })
            }else{
                res.status(404).json({message: "Product not found, invalid id"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error : err});
        });
});


router.patch('/:productId',(req,res, next)=>{
    var id = req.params.productId;
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propertyName] = ops.value;
    }
    Product.update({_id: id}, {$set : updateOps})
            .exec()
            .then(result => {
                console.log(result);
                res.status(200).json({
                    message: "Product Details Change",
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/products/" + id
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error : err});
            });
});

router.delete('/:productId', checkAuth,(req,res, next)=>{

    var id = req.params.productId;

    Product.deleteOne({_id : id})
            .exec()
            .then(result =>{
                console.log(result);
                res.status(200).json({
                    message: "Product Deleted Successfully",
                    request:{
                        type: "POST",
                        description: "To add the nw product below is the link",
                        url: "http://localhost:3000/products"

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
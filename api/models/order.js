const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    product:{
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Product' ,//Name of other model where you want to refer it
        required: true
    },
    quantity : { 
        type : Number , default: 1
    }
});


module.exports = mongoose.model('Order', orderSchema);
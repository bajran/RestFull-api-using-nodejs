const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail Exist'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User Created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
});

router.post('/login', (req, res, next) => {
    var email = req.body.email;

    User.find({ email: email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Authentication Failed"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authentication Failed"
                    })
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                            "secret",
                        {
                            expiresIn: "1h"
                        });

                    return res.status(200).json({
                        message: 'Authentication Sucessfull',
                        token : token
                    })
                }
                res.status(401).json({
                    message: "Authentication Failed"
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: err
            })
        })
})


router.delete('/:userId', (req, res, next) => {
    var id = req.params.userId;
    User.deleteOne({ _id: id })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "User Deleted Successfully"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: err
            })
        })
});




module.exports = router;
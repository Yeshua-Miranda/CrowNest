const bcrypt = require('bcrypt');
const User = require('../models/user.js');

exports.registerUser = async (req, res) => { 
    try {
        if (req.body.password !== req.body.confirm_password) {
            return res.status(401).json ({
                msg: "Passwords Missmatch",
                status:401
            })
        }
        let cryptPass = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: cryptPass
        });
        const savedUser = await newUser.save();
        return res.send(savedUser);

    } catch (err) {
        console.log(err.message)
        res.status(400).json({
            msg: err.message,
            ststus:400
        })
    }
}

exports.login = (req,res) => {

}

exports.getUser = (req,res) => {

}

exports.updateUserInfo = (req,res) => {

}

exports.deleteUserInfo = (req,res) => {

}
const User = require('../models/user.js');

exports.registerUser = (req,res) => {
    try {
        if(req.body.password != req.body.confirm_password){
           res.JSON ({
                msg: "Passwords Missmatch",
                status: 401
            })
        }
        else{
            if(req.body.name){

            }
            let new_user = {
                name: req.body.name, 
                email: req.body.email, 
                password: req.body.password, 
                joined_at: new Date()
            }
            let user = new User(new_user);
            user.save().then((doc) => {
                res.send(user);
            });
        }
    } catch (err) {
        res.JSON({
            msg: err,
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
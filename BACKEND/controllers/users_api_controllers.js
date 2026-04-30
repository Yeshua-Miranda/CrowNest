const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const secretKey = 'poo_el_guerrero_dragon';

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
            password: cryptPass,
            joined_at: new Date()
        });
        const savedUser = await newUser.save();
        return res.send(savedUser);

    } catch (err) {
        console.log(err.message)
        res.status(400).json({
            msg: err.message,
            status:400
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({
                msg: "Usuario no encontrado",
                status: 401
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                msg: "Contraseña incorrecta",
                status: 401
            });
        } else {
            const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
            return res.json({token, user});
        }

    } catch (err) {
        res.status(500).json({
            msg: "Error en el servidor",
            status: 500
        });
    }
}

exports.authMiddelwere =  async (req,res,next) => {
    const token = req.headers.authorization;

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                message: 'Unauthorized',
                status: 401 
            });
        }
        res.json({ message: 'Ruta Protegida', user: decoded });
    });
}


exports.getUser = (req,res) => {

}

exports.updateUserInfo = (req,res) => {

}

exports.deleteUserInfo = (req,res) => {

}
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
            const payload = { id: user._id, email: user.email };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            return res.json({
                token,
                user: { id: user._id, email: user.email, name: user.name }
            });
        }

    } catch (err) {
        res.status(500).json({
            msg: "Error en el servidor",
            status: 500
        });
    }
}


exports.authMiddelwere = async (req, res, next) => {
    // Busca el token en el header de autorización
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    // Verifica que exista un token
    if (!token) {
        return res.status(401).json({ message: 'No hay token, acceso denegado', status: 401 });
    }

    // Que sea valido el token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado', status: 401 });
        }
        
        req.user = decoded; 
        
        next(); 
    });
}

/*
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
}*/


exports.getUser = (req,res) => {

}

exports.updateUserInfo = (req,res) => {

}

exports.deleteUserInfo = (req,res) => {
    
}
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const secretKey = 'poo_el_guerrero_dragon';

const List = require('../models/list.js');
const Review = require('../models/review.js');

exports.registerUser = async (req, res) => { 
    try {
        if (req.body.password !== req.body.confirm_password) {
            return res.status(401).json({
                msg: "Passwords Missmatch",
                status: 401
            });
        } 
 
        let cryptPass = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: cryptPass,
            joined_at: new Date()
        });

        const savedUser = await newUser.save();

        const last = await List.findOne().sort({ id: -1 });
        const newId = last ? last.id + 1 : 1;

        await List.create({
            id: newId,
            userId: savedUser._id,
            nombre: "Favoritos",
            descripcion: "Lista automática",
            visibilidad: "privada",
            isDefault: true,
            peliculas: []
        });

        const payload = { id: savedUser._id, email: savedUser.email };
        const token = jwt.sign(payload, secretKey, { expiresIn: '3h' });

        const payload = { id: savedUser._id, email: savedUser.email };
        const token = jwt.sign(payload, secretKey, { expiresIn: '3h' });
        return res.json({
            msg: "Usuario registrado correctamente",
            token: token,
            user: savedUser
            
        });

    } catch (err) {
        res.status(400).json({
            msg: err.message,
            status: 400
        });
    }
};

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
            const token = jwt.sign(payload, secretKey, { expiresIn: '3h' });
            return res.json({
                token,
                user: user
            });
        }

    } catch (err) {
        res.status(500).json({
            msg: "Error en el servidor",
            status: 500
        });
    }
}

 exports.optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        try {
            req.user = jwt.verify(token, secretKey);
        } catch (_) {}
    }
    next();
}

exports.authMiddelwere = async (req, res, next) => {
    // Busca el token en el header de autorización
    const authHeader = req.headers.authorization;
    //const token = authHeader && authHeader.split(' ')[1]; 
    const token = authHeader;
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

exports.getUser = async (req,res) => {
    try {
        const id = parseInt(req.params.id);

        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrada" });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({ error: "Error al obtener el usuario" });
    }
}

exports.getSocialData = async (req, res) => {
    try {
        const mainUser = await User.findById(req.params.id);
        if (!mainUser) return res.status(404).json({ msg: "Usuario no encontrado" });

        const friends = await User.find({ _id: { $in: mainUser.friends } }).select('name profile_photo');
        const requests = await User.find({ _id: { $in: mainUser.friend_request } }).select('name profile_photo');
        
        const suggestions = await User.find({ 
            _id: { $nin: [...mainUser.friends, mainUser._id] } 
        }).limit(5).select('name profile_photo');

        res.json({ friends, requests, suggestions });
    } catch (err) {
        res.status(500).json({ msg: "Error al obtener datos sociales" });
    }
};


exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const id = req.params.id;
        const type = parseInt(req.params.type);

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

        const allUsers = await User.find({ _id: { $ne: id } }); 
        
        let filtered = [];

        const userFriends = user.friends || [];
        const userRequests = user.friend_request || [];

        switch (type) {
            case 1: 
                filtered = allUsers.filter(u => 
                    !userFriends.includes(u._id.toString()) && 
                    !userRequests.includes(u._id.toString())
                );
                break;
            case 2:
                filtered = allUsers.filter(u => 
                    userFriends.includes(u._id.toString())
                );
                break;
            case 3: 
                filtered = allUsers.filter(u => 
                    userRequests.includes(u._id.toString())
                );
                break;
            default:
                return res.status(400).json({ mensaje: "Tipo de búsqueda inválido" });
        }
        
        const total = filtered.length;
        const paginatedUsers = filtered.slice((page - 1) * limit, page * limit);

        const result = paginatedUsers.map(u => ({
            _id: u._id,
            name: u.name,
            nick_name: u.nick_name,
            public: u.public,
            profile_photo: u.profile_photo,
            banner_photo: u.banner_photo
        }));

        res.json({
            page,
            total,
            data: result
        });

    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
    }
}

exports.updateUserInfo = async (req,res) => {
    try {
        const userId = req.user.id || req.user._id;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ msg: "Usuario no encontrado", status: 404 });
        }

        if (req.body.password) {
            const isSamePassword = bcrypt.compareSync(req.body.password, currentUser.password);

            if (isSamePassword) {
                delete req.body.password;
            } else {
                req.body.password = bcrypt.hashSync(req.body.password, 10);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            req.body, 
            { new: true, runValidators: true }
        ).select("-password"); 

        return res.json({
            msg: "Perfil actualizado correctamente",
            user: updatedUser 
        });

    } catch (err) {
        return res.status(400).json({ msg: err.message, status: 400 });
    }
}

exports.deleteUserInfo = async (req,res) => {
    console.log("Intentando eliminar usuario con ID:", req.params.id);
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ msg: "Usuario no encontrado", status: 404 });
        }

        return res.json({ msg: "Cuenta de usuario eliminada correctamente" });

    } catch (err) {
        console.log("Error al eliminar usuario:", err.message); 
        return res.status(500).json({ msg: "Error al eliminar el usuario", status: 500 });
    }
}


exports.getOtherUser = async (req, res) => {
    try {
        const requestedUserId = req.params.id;
        const currentUserId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
            return res.status(400).json({ msg: "ID inválido" });
        }

        /*
        if (requestedUserId === currentUserId) {
            return res.status(400).json({ msg: "Usa tu perfil propio" });
        }
        */
        
        const user = await User.findById(requestedUserId)
            .select("name nick_name profile_photo banner_photo public");

        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        const objectId = new mongoose.Types.ObjectId(requestedUserId);

        const favorites = await List.findOne({
            userId: objectId,
            isDefault: true
        });

        const reviews = await Review.find({
            userId: objectId
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("movieTitle moviePoster rating reviewText createdAt movieId");

        return res.json({
            user,
            favorites: favorites?.peliculas || [],
            recentReviews: reviews
        });

    } catch (err) {
        console.error("ERROR REAL:", err); 
        return res.status(500).json({
            msg: "Error al obtener perfil",
            error: err.message
        });
    }
};

exports.addFriend = async (req, res) => {
    try {
        const targetUserId = req.params.id; 
        const currentUserId = req.user.id; 

        if (targetUserId === currentUserId) {
            return res.status(400).json({ msg: "No puedes agregarte a ti mismo" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (targetUser.friends.includes(currentUserId)) {
            return res.status(400).json({ msg: "Ya eres amigo de este usuario" });
        }
        
        if (targetUser.friend_request.includes(currentUserId)) {
            return res.status(400).json({ msg: "Ya has enviado una solicitud a este usuario" });
        }

        if (targetUser.public) {
            await User.findByIdAndUpdate(targetUserId, { 
                $addToSet: { friends: currentUserId } 
            });
            await User.findByIdAndUpdate(currentUserId, { 
                $addToSet: { friends: targetUserId } 
            });

            return res.json({ 
                msg: "Usuario agregado a tu lista de amigos", 
                status: "friends" 
            });
        } else {
            await User.findByIdAndUpdate(targetUserId, { 
                $addToSet: { friend_request: currentUserId } 
            });

            return res.json({ 
                msg: "Solicitud de amistad enviada", 
                status: "pending" 
            });
        }

    } catch (err) {
        return res.status(500).json({ 
            msg: "Error al procesar la solicitud de amistad", 
            error: err.message 
        });
    }
};

exports.handleFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params; 
        const { action } = req.body;     
        const currentUserId = req.user.id; 

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ msg: "Acción no válida" });
        }

        const user = await User.findByIdAndUpdate(currentUserId, {
            $pull: { friend_request: requestId }
        }, { new: true });

        if (action === 'accept') {
            await User.findByIdAndUpdate(requestId, {
                $addToSet: { friends: currentUserId }
            });
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { friends: requestId }
            });

            return res.json({ msg: "Solicitud aceptada. Ahora son amigos." });
        }

        return res.json({ msg: "Solicitud rechazada correctamente." });

    } catch (err) {
        return res.status(500).json({ msg: "Error al procesar la solicitud", error: err.message });
    }
};
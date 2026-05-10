/*
const usersControllers = require( '../controllers/users_api_controllers.js');

const express = require('express'); 

const routerUsers = express.Router();
routerUsers.post('/',usersControllers.registerUser);


routerUsers.get("/other/:id", usersControllers.authMiddelwere, usersControllers.getOtherUser);

routerUsers.post('/add-friend/:id', usersControllers.authMiddelwere, usersControllers.addFriend);

routerUsers.post('/friend-request/:requestId', usersControllers.authMiddelwere, usersControllers.handleFriendRequest);

routerUsers.get('/:type/:id',usersControllers.getUsers);


routerUsers.use('/:id', usersControllers.authMiddelwere);

routerUsers.get('/:id', usersControllers.getUser);

routerUsers.put('/:id',usersControllers.updateUserInfo);

routerUsers.delete('/:id',usersControllers.deleteUserInfo);

module.exports = routerUsers;   
*/
const usersControllers = require('../controllers/users_api_controllers.js');
const express = require('express'); 
const routerUsers = express.Router();

// 1. Rutas Públicas (Sin auth)
routerUsers.post('/', usersControllers.registerUser);

// 2. Middleware de autenticación para TODO lo que sigue
// Esto simplifica el código y evita repetirlo en cada línea
routerUsers.use('/:id', usersControllers.authMiddelwere);

// 3. Rutas Específicas de Acción (Métodos claros)
routerUsers.delete('/:id', usersControllers.deleteUserInfo); // <-- Súbelo aquí
routerUsers.put('/:id', usersControllers.updateUserInfo);
routerUsers.get('/:id', usersControllers.getUser);

// 4. Rutas con parámetros variables (Al final)
routerUsers.get("/other/:id", usersControllers.getOtherUser);
routerUsers.post('/add-friend/:id', usersControllers.addFriend);
routerUsers.post('/friend-request/:requestId', usersControllers.handleFriendRequest);

// Esta ruta es la más peligrosa por ser la más genérica, déjala al último
routerUsers.get('/:type/:id', usersControllers.getUsers);

module.exports = routerUsers;
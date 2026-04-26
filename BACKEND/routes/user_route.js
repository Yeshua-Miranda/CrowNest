const usersControllers = require( '../controllers/users_api_controllers.js');

const express = require('express'); 

const routerUsers = express.Router();
routerUsers.post('/',usersControllers.registerUser);

routerUsers.get('/:id',usersControllers.getUser);

routerUsers.patch('/:id',usersControllers.updateUserInfo);

routerUsers.delete('/:id',usersControllers.deleteUserInfo);

module.exports = routerUsers; 
const express = require('express'); 
const path = require('path');

const usersControllers = require( '../controllers/users_api_controllers.js');

const routerApi = express.Router();

const userRoutes = require('users_route.js');
routerApi.use('/users',userRoutes);

routerApi.post('/login',usersControllers.login);

module.exports = routerApi; 

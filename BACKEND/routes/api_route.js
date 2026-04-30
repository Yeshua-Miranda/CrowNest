const express = require('express'); 
const path = require('path');

const usersControllers = require( '../controllers/users_api_controllers.js');

const routerApi = express.Router();

const userRoutes = require('./user_route.js');
routerApi.use('/users',userRoutes);

routerApi.get('/home.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/home.html"))
);

routerApi.get('/login.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/login.html"))
);

routerApi.get('/movie.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/movie.html"))
);

routerApi.post('/login',usersControllers.login);

module.exports = routerApi; 
 

const express = require('express'); 
const path = require('path');
const routerApi = express.Router();


const reviewsRoutes = require('./review_route.js');
const userRoutes = require('./user_route.js');
//const listRoutes = require('./list_route.js');
routerApi.use('/users',userRoutes);
routerApi.use('/reviews', reviewsRoutes);
//routerApi.use('/lists',listRoutes);


const usersControllers = require( '../controllers/users_api_controllers.js');

routerApi.post('/login',usersControllers.login);

routerApi.get('/home.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/home.html"))
);

routerApi.get('/login.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/login.html"))
);

routerApi.get('/movie.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/movie.html"))
);

routerApi.get('/profile.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/profile.html"))
);

routerApi.get('/calendar.html',(req,res) => 
    res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/calendar.html"))
);

routerApi.get('/',(req,res) =>{
        let auth = req.get('x-auth');
        if(auth){
            res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/home.html"))
        } else {
            res.sendFile(path.resolve(__dirname+"/../../FRONTEND/views/login.html"))
        }
    }
);

module.exports = routerApi; 
 
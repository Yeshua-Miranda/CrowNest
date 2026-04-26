const express = require('express'); 
const path = require('path');

const routerApi = express.Router();

const userRoutes = require('./users');
routerApi.use('/users',userRoutes);



module.exports = routerApi; 


const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/api_route.js'); 
const cors = require("cors");


const dbConfig = require('./database/config.js'); 

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());
app.use(router); 

app.use(express.static('FRONTEND'));
app.use('/controllers', express.static('../FRONTEND/controllers'));
app.use('/views', express.static('../FRONTEND/views'));
app.use('/assets', express.static('../FRONTEND/assets'));

mongoose.connect(dbConfig.MONGODB_URI)
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Servidor en puerto ${PORT}`);
        });
    })
    .catch(err => console.error('Error de conexión:', err));

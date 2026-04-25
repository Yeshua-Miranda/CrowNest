
const express = require('express');
const mongoose = require('mongoose');

const dbConfig = require('./database/config'); 

const app = express();
const PORT = 3000;

app.use(express.json());


mongoose.connect(dbConfig.MONGODB_URI)
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Servidor en puerto ${PORT}`);
        });
    })
    .catch(err => console.error('Error de conexión:', err));
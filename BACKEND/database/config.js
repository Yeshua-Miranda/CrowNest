
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurada. Crea BACKEND/.env antes de iniciar el servidor.');
}

module.exports = {
    MONGODB_URI
};


import uniqueValidator from 'mongoose-unique-validator'
const mogoose = require('mongoose'); 
  

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min:[1,"El nombre no puede ser nulo"]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: [8, "El password tiene que tener 8 o más caracteres"]
    },
    joined_at: { 
        type: Date,
        require: true
    }
});

let User = mongoose.model('users', userSchema);
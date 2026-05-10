const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min:[1,"El nombre no puede ser nulo"],
        unique: true
    },
    nick_name: {
        type: String,
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
    },
    friends: {
        type: [String]
    },
    friend_request: {
        type: [String]
    },
    public: {
        type: Boolean,
        default: false
    },
    profile_photo: {
        type: Number,
        default: 1
    },
    banner_photo: {
        type: Number,
        default: 1
    } 
});

userSchema.pre('findOneAndDelete', async function() {
    const docToId = this.getQuery()._id;
    const mongoose = require('mongoose');
    
    await mongoose.model('List').deleteMany({ userId: docToId });
    await mongoose.model('Review').deleteMany({ userId: docToId });
    await mongoose.model('User').updateMany(
        {}, 
        { $pull: { friends: docToId, friend_request: docToId } }
    );
});


module.exports = mongoose.model('User', userSchema);
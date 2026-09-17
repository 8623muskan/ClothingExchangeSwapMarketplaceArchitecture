const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        location: {
            type: String,
            trim: true,
            default: ''
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        avatar: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

userSchema.index({ username: 1 });


module.exports =
    mongoose.models.User ||
    mongoose.model('User', userSchema);


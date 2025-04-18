const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin','delivery','customer'],
        default: 'customer',
        required: true,
    },
    housenumber: {
        type: String,
        default: ''
    },
    plotnumber: {
        type: String,
        default: ''
    },
    street :{
        type: String,
        default: ''
    },
    landmark :{
        type: String,
        default: ''
    },
    county :{
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: 'Kenya'
    },
    customerBonus: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    }
})

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    image: {
        type: String,
        default: '',
        required: true
    },
    gallery: [{
        type: String,
    }],
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        lowercase: true
    },
    price : {
        type: Number,
        default:0
    },
    originalprice: {
        type: Number,
        default: 0,
    },
    sizes: [{
        type: String
    }],
    color: {
        type: String,
        lowercase: true
    },
    stock: {
        type: Number
    },
    featured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    brand: {
        type: String,
        default: "Generic",
        lowercase: true
    },
    material: {
        type: String,
        default: "",
        lowercase: true
    },
    usage: {
        type: String,
        default: "",
        lowercase: true
    },
    finish: {
        type: String,
        default: "",
        lowercase: true
    },
    reviews: {
        type: Number,
        default: 34,
        min: 0
    },
    rating: {
        type: Number,
        default: 4,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        default: "active",
    }
})

productSchema.pre("validate", function (next) {
    if (this.originalprice < this.price) {
        this.originalprice = this.price;
    }
    next();
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
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
        unique: true
    },
    description: {
        type: String
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
        type: String
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
    },
    reviews: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4,
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
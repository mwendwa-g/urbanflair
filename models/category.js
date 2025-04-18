const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    productCount: { 
        type: Number, 
        default: 0 
    }
})

categorySchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);
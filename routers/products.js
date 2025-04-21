const {Product} = require("../models/product");
const {Category} = require("../models/category");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const upload = require('../models/storage');
const { finished } = require("stream");
const fs = require('fs');
const { gravity } = require("sharp");
const cloudinary = require('cloudinary').v2


//CREATING A PRODUCT
const fileUpload = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5}
]);
router.post(`/`, (req, res, next) => {
    fileUpload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: "Only 5 images are allowed for gallery." });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(500).json({ message: "An error occurred during file upload." });
      }
      next();
    })
  },async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
        return res.status(400).json({ message: "Invalid category ID" });
    }
    const category = await Category.findById(req.body.category);
    if(!category) {
        return res.status(400).send("Invalid Category");
    }
    if (!req.files || !req.files.image) {
        return res.status(400).json({message: "No image in the request"});
    }

    const imagePath = req.files.image[0].path; 
    const galleryPaths = req.files.gallery ? req.files.gallery.map(file => file.path) : [];

    try{
        const uploadedImage = await cloudinary.uploader.upload(imagePath, {
            transformation: [{ width: 320, height: 350, crop: "fill", gravity: "center" }]
        });

        const uploadedGallery = await Promise.all(
            galleryPaths.map(path =>
                cloudinary.uploader.upload(path, {
                    transformation: [{ width: 320, height: 350, crop: "fill", gravity: "center" }]
                })
            )
        );

        const imageUrl = uploadedImage.secure_url;
        const galleryUrls = uploadedGallery.map(result => result.secure_url);

        let product = new Product({
            image: imageUrl,
            gallery: galleryUrls,
            description: req.body.description,
            name: req.body.name,
            price: req.body.price,
            originalprice: req.body.originalprice,
            sizes: req.body.sizes,
            color: req.body.color,
            stock: req.body.stock,
            featured: req.body.featured,
            category: req.body.category,
            brand: req.body.brand,
            reviews: req.body.numReviews,
            rating: req.body.rating,
            material: req.body.material,
            usage: req.body.usage,
            finish: req.body.finish
        })
        product = await product.save();
        await updateProductCount(req.body.category);
        if(!product){
            return res.status(500).json({message: 'The product cannot be created!'})
        }
        res.send(product)
    }catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "A product with this name already exists. Please choose a different name."
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(' ')
            });
        }

        res.status(500).json({message: "Something went wrong on the server"});
    }
})

//GETTING ALL PRODUCTS WHICH ALSO GETS PRODUCTS BY CATEGORY
router.get(`/`, async (req, res) => {
    //loalhost:3000/api/f1/products?categories=3948,20498
    let filter = {};
    if(req.query.categories) {
        const categoryIds = req.query.categories.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
        filter = { category: { $in: categoryIds }, status: 'active' };
    }
    try {
        const productList = await Product.find(filter)
            .populate('category')
            .sort({ name: 1 });
        if (!productList || productList.length === 0) {
            return res.status(404).json({ success: false, message: 'No products found!' });
        }
        res.status(200).send(productList);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
})

//GETTING A SINGLE PRODUCT
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    }
    res.send(product);
})

//UPDATING A PRODUCT
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid product ID");
    }

    try {
        const { action, size, status, featured, ...otherUpdates } = req.body; // Extract 'action' and 'size'

        // Find the product by ID
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');

        // ✅ Handle size updates separately
        if (action && size) {
            if (action === "add") {
                if (!product.sizes.includes(size)) {
                    product.sizes.push(size); // Add the size
                } else {
                    return res.status(400).json({ message: "Size already exists" });
                }
            } else if (action === "remove") {
                product.sizes = product.sizes.filter(s => s !== size); // Remove the size
            } else {
                return res.status(400).json({ message: "Invalid action" });
            }

            await product.save();
            return res.json({ message: `Size ${action}ed successfully!`, product });
        }
        if (status !== undefined) {
            product.status = status;
            await product.save();
        }

        if (featured !== undefined) {
            product.featured = featured;
            await product.save();
        }

        // ✅ Update other product fields (only update fields that exist in the request)
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: otherUpdates },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(400).send('The product cannot be updated!');
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Server error");
    }
});

//DELETING A PRODUCT
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await Product.findByIdAndDelete(req.params.id);
        await updateProductCount(product.category);
        return res.status(200).json({ success: true, message: 'Product is deleted!' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});


//SHOWING NUMBER OF PRODUCTS
router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({ productCount: productCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



//GETTING FEATURED PRODUCTS
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({featured: true}).limit(+count)
    .sort({ name: 1 });

    if(!products) {
        res.status(500).json({success: false})
    }
    res.send(products);
})

// Fetch products based on cart items
router.post("/cart/items", async (req, res) => {
    try {
        const cart = req.body.cart;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty or invalid" });
        }
        const productIds = cart.map(item => item.product_id);

        const products = await Product.find({ _id: { $in: productIds } }).populate("category");
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart items", error });
        return;
    }    
});



async function updateProductCount(categoryId) {
    const count = await Product.countDocuments({ category: categoryId });
    await Category.findByIdAndUpdate(categoryId, { productCount: count });
}

module.exports = router 
const {Order} = require('../models/order');
const { OrderItem } = require('../models/order-item');
const {User} = require('../models/user');
const {Product} = require('../models/product');
const express = require('express');
const router = express.Router();

//MAKING AN ORDER
router.post('/', async (req, res) => {
    try {
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async orderItem => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        }));

        const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            return orderItem.product.price * orderItem.quantity;
        }));

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIds,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        order = await order.save();
        if (!order) {
            return res.status(400).send('The order cannot be processed!');
        }
        for (const orderItem of req.body.orderItems) {
            const product = await Product.findById(orderItem.product);
            if (product) {
                product.countInStock -= orderItem.quantity; 
                await product.save();
            }
        }
        await User.findByIdAndUpdate(req.body.user, {
            $inc: { totalSpent: totalPrice }
        });
        res.send(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


//GETTING AN ORDER
router.get(`/`, async (req, res)=>{
    const orderList = await Order.find()
    .populate('user')
    .populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            model: 'Product'  
        }
    })
    .sort({ 'dateOrdered': -1 });

    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

//GETTING ONLY FIVE OF THEM ORDER
router.get(`/five`, async (req, res)=>{
    const orderList = await Order.find().populate('user').sort({'dateOrdered': -1}).limit(5);
    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

//GETTING A SINGLE ORDER
router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }});

    if(!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
})

//UPDATING ORDER STATUS
router.put('/:id', async (req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be updated!')

    res.send(order);
})

//UPDATING PAYMENT
router.put('/payment/:id', async (req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            payment: req.body.payment
        },
        {new: true}
    )
    if(!order)
    return res.status(400).send('the payment cannot be updated!')
    res.send(order);
})

//DELETING AN ORDER
router.delete('/:id',(req,res)=>{
    Order.findByIdAndDelete(req.params.id).then(async order=>{
        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" });
        }

        await Promise.all(order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndDelete(orderItem);
        }));
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

//GETTING TOTAL SALES
router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ]);

    if (totalSales.length === 0) {
        return res.send({ totalSales: 0 });
    }

    res.send({ totalSales: totalSales.length > 0 ? totalSales[0].totalsales : 0 });
})

//GETTING ORDER COUNT
router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        res.send({orderCount: orderCount});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

//GETTING USER ORDERS
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

module.exports = router;
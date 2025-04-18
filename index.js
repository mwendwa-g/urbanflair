const express = require('express');
const app = express();
const path = require('path');
require("dotenv").config();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require("./helpers/error-handler");
const api = process.env.API_URL

//SAVING LOGS TO A FILE
const logDirectory = path.join(__dirname, "logs");
const logFile = path.join(logDirectory, "morgan.log");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
const logStream = fs.createWriteStream(logFile, { flags: "a" });
app.use(morgan('combined', { stream: logStream }));


//MIDDLEWARES
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(cors());
app.options("*", cors());
app.use(errorHandler);
//app.use(authJwt())

//ROUTES
const productsRoutes = require("./routers/products");
const categoriesRoutes = require("./routers/categories");
const usersRoutes = require("./routers/users");
const ordersRoutes = require("./routers/orders");

//UTILIZATION
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes)


//DATABASE
mongoose.connect(process.env.CONNECTION_STRING,{
    dbName: 'urbanflair',
})
.then(() => {
    console.log('Connected to urbanflair database');
})
.catch((err) => {
    console.log(err);
})


//creating server
app.listen(1100, () => {
    console.log(api)
    console.log("App is running on port 1100")
})


//serving the static files
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/rald", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/delivery", (req, res) => {
    res.sendFile(path.join(__dirname, "orders-list.html"));
});
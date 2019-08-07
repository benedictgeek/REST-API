const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')

const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const feedRoutes = require('./routes/feed')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Math.random() + '-' + file.originalname);
    }
})
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }else {
        cb(null, true);
    }
}

const app = express();

app.use(bodyParser.json());
app.use('/images',express.static(path.join(__dirname, 'images')))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, PUT, POST');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');

    next();
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) =>{
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message: message,
        hasError: true,
        data: error.data
    })
})

mongoose.connect('mongodb://localhost:27017/message')
.then(result => {
    app.listen(8080);
})
.catch(err => {
    console.log(err);
})
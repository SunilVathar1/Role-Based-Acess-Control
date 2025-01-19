const express = require('express');
const createHttpErrors = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const session=require('express-session');
const connectFlash=require('connect-flash');
const passport=require('passport');
const MongoStore =require('connect-mongo');
const connectEnsureLogin=require('connect-ensure-login');
const { roles } = require('./utils/constants');



//Initialization
const app = express();
const port = process.env.PORT || 3000;
app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Init Session
app.use(session({
    secret:process.env.SECREAT_KEY,
    resave:false,
    saveUninitialized:false,
    cookie:{
        // secure:true,
        httpOnly:true,   
    },
    store: MongoStore.create({
        mongoUrl:process.env.MONGO_URI
    })
}))

// For passport js Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport-auth');

app.use((req,res,next)=>{
    res.locals.user=req.user;
    next();
})

app.use(connectFlash());
app.use((req,res,next)=>{
    res.locals.messages=req.flash()
    next();
})

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/user',connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}),require('./routes/user.route'));
app.use('/admin',
    connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}),
    ensureAdmin,
    require('./routes/admin.route'))

app.use((req, res, next) => {
    console.log('Requested path:', req.path);
    console.log('Views directory:', app.get('views'));
    next();
});

// 404 handler
app.use((req, res, next) => {
    next(createHttpErrors(404, 'Route not found'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    // Set status code
    const statusCode = error.status || 500;

    // Log the error
    console.error(error);
    res.status(error.status)
    res.render('error-40x',{error})
    // Send error response
    // res.status(statusCode).json({
    //     status: statusCode,
    //     message: error.message || 'Internal Server Error',
    //     ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    // });
});



// Database connection and server start
mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
}).then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log(`Application started at port ${port}`);
    });
}).catch((error) => {
    console.error("Failed to connect to MongoDB", error);
});

// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next(); // Proceed if authenticated
//     } else {
//         return res.redirect('/auth/login'); // Redirect if not authenticated
//     }
// }

function ensureAdmin(req,res,next){
    if(req.user.role===roles.ADMIN){
        next()
    }else{
        req.flash('warning',`You're not authorised to see this route`)
        res.redirect('/')
    }
}

module.exports = app;
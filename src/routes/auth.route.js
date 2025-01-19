
const passport = require('passport');
const User = require('../models/user-model')
const { body, validationResult } = require('express-validator');
const { registerValidator } = require('../utils/validators');
const router = require('express').Router()


router.get(
    '/register',
    ensureNotAuthenticated, 
    async (req, res, next) => {
    // req.flash('error','Some Error')
    // req.flash('error','Some Error')
    // req.flash('info','Some-value')
    // req.flash('warning','Some-value')
    // req.flash('success','Some-value')
    // const messages=req.flash();
    // console.log(messages);
    res.render('register')
});

router.post(
  "/register",
  ensureNotAuthenticated,
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash("error", error.msg);
        });
        res.render("register", {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }
      const { email } = req.body;
      const doesExist = await User.findOne({ email: email });
      if (doesExist) {
        req.flash("msg", "Email already exists");
        const message = req.flash();
        res.render("register");
        return;
      }
      const user = new User(req.body);
      await user.save();
      req.flash(
        "info",
        `${user.email} Registered Sucessfully now you can login`
      );
      res.redirect("login");
      // res.send(user)
    } catch (error) {
      next(error);
    }
  }
);

router.get(
    "/login",
    ensureNotAuthenticated,
    async (req, res, next) => {
        res.render("login", {
            title: "login",
            user: req.user || null,
        });
    });
router.post(
    '/login',
    ensureNotAuthenticated,
    passport.authenticate('local', {
        // successRedirect: '/user/profile',
        successReturnToOrRedirect:'/',
        failureRedirect: '/auth/login',
        failureFlash: true,
    }));

    router.get(
        "/logout",
         ensureAuthenticated, (req, res) => {
      req.logout((err) => {
        if (err) {
          return next(err); // Handle error if needed
        }
        // Redirect to login page or home page after logout
        res.redirect("/");
      });
    });
    
 function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) {
     return next(); // Proceed if authenticated
   } else {
     return res.redirect("/auth/login"); // Redirect if not authenticated
   }
 }
    
    function ensureNotAuthenticated(req, res, next) {
      console.log("User not authenticated:", req.isAuthenticated());
      if (req.isAuthenticated()) {
        res.redirect("back"); // Proceed to the next middleware or route handler
      } else {
        // console.log('Redirecting to login');
        // res.redirect('/auth/login'); // Redirect to login page
        next();
      }
    }

module.exports = router;
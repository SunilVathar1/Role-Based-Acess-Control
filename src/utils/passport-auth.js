const passport=require('passport')
const LocalStrategy=require('passport-local').Strategy
const User=require('../models/user-model')

passport.use(
    new LocalStrategy({
        usernameField:'email',
        passwordField:'password'
    },async (email,password,done) => {
    try {
        const user=await User.findOne({email})
        if(!user){
       // user name or email does not exists
       return done(null,false,{message:'user not found'})
        }
        // email exists now we need to verify the password
        const isMatch=await user.isValidPassword(password)

        return isMatch 
        ? done(null, user) 
        : done(null, false,{message:'Incorrect Password'})

    } catch (error) {
         done(error)
    }
}))

//Note
// this function means it for setting the user id inside the seesion and and session will create cookie inside it internally 
passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  //Note
  //  whenever a request comes form a server it contains a cookie from that cookie we find session
  passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user); // Attach user object to request
        })
        .catch(err => {
            done(err);
        });
});
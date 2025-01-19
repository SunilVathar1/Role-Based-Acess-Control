const { ensureAuthenticated } = require('./auth.route');

const router=require('express').Router();

router.get('/profile',async(req,res,next)=>{
    const user=req.user;
    // console.log(user)
    res.render('profile',{user});
})

module.exports=router
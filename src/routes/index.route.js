const router=require('express').Router()

router.get('/',async(req,res)=>{
    res.render('index',{
        user: req.user || null,
        // Add any other necessary variables
        title: 'Home Page'
    })
})

module.exports=router
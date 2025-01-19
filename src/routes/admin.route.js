const User = require('../models/user-model');
const mongoose=require('mongoose');
const { roles } = require('../utils/constants');
const router=require('express').Router()

router.get('/users',async (req,res,next) => {
    try {
        const users=await User.find()
        res.render('manage-users',{users})
    } catch (error) {
        next(error);
    }
})
router.get('/user/:id',async (req,res,next) => {
    try {
        const {id}=req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error','Invalid Id');
            res.redirect('back');
        }
        const user=await User.findById(id)
        res.render('profile',{user})
    } catch (error) {
        next(error);
    }
})
router.post('/update-role', async (req, res, next) => {
    try {
      const { id, role } = req.body;
  
      // Checking for id and roles in req.body
      if (!id || !role) {
        req.flash('error', 'Invalid request');
        return res.redirect('/admin/users')
      }

      // Trim whitespace from id
      const trimmedId = id.trim();

      console.log(id);

      // Check for valid mongoose objectID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid id');
       return res.redirect('/admin/users')
      }
  
      // Check for Valid role
      const rolesArray = Object.values(roles);
      if (!rolesArray.includes(role)) {
        req.flash('error', 'Invalid role');
        return res.redirect('/admin/users')
      }
  
      // Admin cannot remove himself/herself as an admin
      if (req.user.id === id) {
        req.flash(
          'error',
          'Admins cannot remove themselves from Admin, ask another admin.'
        );
        return res.redirect('/admin/users')
      }
  
      // Finally update the user
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      );
  
      req.flash('info', `updated role for ${user.email} to ${user.role}`);
      res.redirect('/admin/users');
    } catch (error) {
      next(error);
    }
  });

module.exports=router;
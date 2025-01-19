const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
// const createHttpError = require('http-errors')
const { roles } = require('../utils/constants')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowerCase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,

    },
    role:{
        type:String,
        enum:[roles.ADMIN,roles.CLIENT,roles.MODERATOR],
        default:roles.CLIENT
    }
})

userSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const hashedPassword = await bcrypt.hash(this.password, 10)
            this.password = hashedPassword;
            if (this.email===process.env.ADMIN_EMAIL) {
                this.role=roles.ADMIN;
            }
        }
        next()
    } catch (error) {
        next(error);
    }

})

userSchema.methods.isValidPassword = async function(password) {
    try {
        console.log(this.password); // Log the stored password for debugging
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Error validating password');
    }
};

const User=mongoose.model('user',userSchema)
module.exports=User;
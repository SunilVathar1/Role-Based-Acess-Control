const {body}=require('express-validator')

module.exports={
    registerValidator:[
        body("email")
          .trim()
          .isEmail()
          .withMessage("Email must be valid")
          .normalizeEmail()
          .toLowerCase(),
    
        body("password")
          .trim()
          .isLength(2)
          .withMessage("password length short,min 2 character"),
    
        body("password2").custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passsword do not match");
          }
          return true;
        }),
      ]
}
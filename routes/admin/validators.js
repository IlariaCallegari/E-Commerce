const { body } = require("express-validator");
const usersRepo = require("../../repositories/users");

module.exports = {
  requireEmail: body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email });
      if (existingUser) {
        throw new Error("Email already in use!");
      }
      return true;
    }),

  requirePassword: body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 characters"),

  requirePasswordConfirmation: body("passwordConfirmation")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 characters")
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error("The passwords must match!");
      }
      return true; 
    }),

  requireEmailExists: body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must provide a valid email")
    .custom(async (email) => {
      const user = await usersRepo.getOneBy({ email });
      if (!user) {
        throw new Error("Email not found!");
      }
      return true;
    }),

  requireValidPasswordForUser: body("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });
      if (!user) {
        throw new Error("Invalid password");
      }
      const validPassword = await usersRepo.comparePasswords(
        user.password,
        password
      );
      if(!validPassword){
        throw new Error('Invalid password');
      }
      return true;
    }),
};

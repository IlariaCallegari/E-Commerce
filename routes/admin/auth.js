const express = require("express");
const { body, validationResult } = require("express-validator");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");

const router = express.Router();

//route handler
router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Must be a valid email")
      .custom(async (email) => {
        const existingUser = await usersRepo.getOneBy({ email });
        if (existingUser) {
          throw new Error("Email already in use!");
        }
      }),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Must be between 4 and 20 characters"),
    body("passwordConfirmation")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Must be between 4 and 20 characters")
      .custom((passwordConfirmation, { req }) => {
        const password = req.body.password;
        if (password !== passwordConfirmation) {
          throw new Error("The passwords do not match!");
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const { email, password, passwordConfirmation } = req.body;
    //create a user in our user repo to represent this person
    const user = await usersRepo.create({ email, password });
    //store the id of that user inside the user cookie
    req.session.userId = user.id;
    res.send("Account created");
  }
);

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate());
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });
  if (!user) {
    return res.send("There is no user signed up with this email");
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send("Password incorrect!");
  }
  req.session.userId = user.id;
  res.send("Yuo are successfully signed in!");
});

module.exports = router;

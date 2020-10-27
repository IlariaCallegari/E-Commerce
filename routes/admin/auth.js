const express = require("express");
const usersRepo = require("../../repositories/users");

const { handleErrors } = require("./middlewares");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators");

const router = express.Router();

//route handler
router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation], handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password } = req.body;
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
  res.send(signinTemplate({}));
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser], handleErrors(signinTemplate),
  async (req, res) => {
    const { email } = req.body;
    const user = await usersRepo.getOneBy({ email });
    req.session.userId = user.id;
    res.send("Yuo are successfully signed in!");
  }
);

module.exports = router;

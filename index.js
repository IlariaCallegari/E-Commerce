const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const usersRepo = require("./repositories/users.js");
const app = express();


//applies body parser to every requests but not to get request
app.use(bodyParser.urlencoded({ extended: true }));

//wire up cookie-session
app.use(cookieSession({
  keys: ['wedqewfvreqg'],

}))

//route handler
app.get("/", (req, res) => {
  res.send(`
    <div>
    Your user id is: ${req.session.userId}
        <form method="POST">
            <input placeholder="email" name= "email" /> 
            <input placeholder="password" name= "password" /> 
            <input placeholder="password confirmation" name= "passwordConfirmation" />
            <button> Sign up </button>
        </form>
    </div> 
    `);
});

app.post("/", async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;
  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) {
    return res.send("Email already in use!");
  }
  if (password !== passwordConfirmation) {
    return res.send("The passwords do not match");
  }
  //create a user in our user repo to represent this person
  const user = await usersRepo.create({ email, password });
  //store the id of that user inside the user cookie
  req.session.userId = user.id; 
  res.send("Account created");
});

//Port
app.listen(3000, () => {
  console.log(`The app is listening on port 3000`);
});

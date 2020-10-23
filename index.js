const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require('./routes/admin/auth');

const app = express();

//applies body parser to every requests but not to get request
app.use(bodyParser.urlencoded({ extended: true }));

//wire up cookie-session
app.use(
  cookieSession({
    keys: ["wedqewfvreqg"],
  })
);
//tell my app to use the authRouter
app.use(authRouter);

//Port
app.listen(3000, () => {
  console.log(`The app is listening on port 3000`);
});

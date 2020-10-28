const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/admin/auth");
const adminProductsRouter = require("./routes/admin/products");
const productsRouter = require("./routes/products");

const app = express();
app.use(express.static("public"));

//applies body parser to every requests but not to get request
app.use(bodyParser.urlencoded({ extended: true }));

//wire up cookie-session
app.use(
  cookieSession({
    keys: ["wedqewfvreqg"],
  })
);
//tell my app to use the Routers
app.use(authRouter);
app.use(adminProductsRouter);
app.use(productsRouter);

//Port
app.listen(3000, () => {
  console.log(`The app is listening on port 3000`);
});

require('dotenv').config({ path: '../.env' });
const express = require("express");
const cors = require("cors");

const myAuth = require("./utils/auth");
const userRouter = require("./routes/userRouter");
const storeRouter = require("./routes/storeRouter");
const adminRouter = require("./routes/adminRouter");

const app = express();

app.use(cors());
app.use(express.json());
app.use(myAuth);

app.use("/user", userRouter);
app.use("/store", storeRouter);
app.use("/admin", adminRouter);

const port = process.env.PORT || 4000;
app.listen(port, "localhost", () => {
  console.log(`server started at port ${port}`);
});

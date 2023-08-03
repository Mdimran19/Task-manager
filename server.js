require("dotenv").config();
const express = require("express");
const app = express();
const bodyparsr = require("body-parser");
const connectDB = require("./config/db");
//const User = require('./models/User');
//const authenticateToken = require('./middleware/auth');
app.use(bodyparsr.json());
connectDB()

//routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/tasks',require('./routes/api/tasks'));
app.use('/api/products',require('./routes/api/products'));



app.get("/", (req, res) => {
  res.json({ message: "welcome to our new app" });
});





//middlew
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});




 



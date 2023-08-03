const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { body,validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
//const Task = require("../../models/Task");
const authenticateToken = require("../../middleware/auth");
//const { default: mongoose } = require("mongoose");

router.post(
  "/",
  [
    body("fname", "fname is not required").notEmpty(),
    body("lname", "lname is required").notEmpty(),
    body("email", "please enter a valid email").notEmpty().isEmail(),
    body("age", "please enter your age").optional().isNumeric(),
    body(
      "password",
      "please enter a password with 6 or more character"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const password = hash;
      const userObj = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        age: req.body.age,
        password: password,
      };

      const user = new User(userObj);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "something is wrong" });
    }
  }
);
router.post("/login",
  //  [
    //  body("type","type is required").notEmpty(),
      //body("type","type must be email or refresh").isIn(['email','refresh'])
    //],
        async (req, res) => {
  try {
   // const {email,password} = req.body
 //   const user = await User.findOne({email: email})
   // if(!user){
 //     res.status(404).json({message: 'user not found'})
  //  }else{
//      const isValidPassword = await bcrypt.compare(password, user.password)
      //if(!isValidPassword){
    //    res.status(401).json({message: 'wrong password'})
  //    }else{
//        const accessToken = jwt.sign({email: user.email,id:user._id},"secret")
        //const refreshToken = jwt.sign({id:user._id},"sceret")
      //  const userObj = user.toJSON()
    //    user['accessToken'] = accessToken
  //      user['refreshToken'] = refreshToken
//        res.json(userObj)
     // }
   // }
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
    const { email, password, type, refreshToken } = req.body;
   if (!type) {
      res.status(401).json({ message: "type is not defind" });
    } else {
      if (type == "email") {
        await handleEmailLogin(email, res, password);
      } else {
        handleRefreshLogin(refreshToken, res);
      }
    }
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.get("/profile", async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    } else {
      res.json({ user: req.user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.body.id;
    const body = req.body;
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});

module.exports = router;

function handleRefreshLogin(refreshToken, res,req) {
  if (!refreshToken) {
    res.status(401).json({ message: "refreshToken is not defind" });
  } else {
    jwt.verify(refreshToken, process.env.JWT_SECRET, async(err, playload)=> { 
      if (err) {
        res.status(401).json({ message: "Unautorized" });
      } else {
        const id = playload.id;
        const user = User.findById(id);
        if (!user) {
          res.status(401).json({ message: "Unauthorized" });
        } else {
          getUserToken(user, res);
        }
      }
    });
  }
}

async function handleEmailLogin(email, res, password) {
  const user = await User.findOne({ email: email });
  console.log(user.password);
  if (!user) {
    res.status(401).json({ message: "user not found" });
  } else {
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "wrong password" });
    } else {
      getUsersTokens(user, res);
    }
  }
}

function getUsersTokens(user, res) {
  const accessToken = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,{ expiresIn: "2d" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,  { expiresIn: "60d" }
  );
  const userObj = user.toJSON();
  userObj["accessToken"] = accessToken;
  userObj["refreshToken"] = refreshToken;
  res.status(200).json(userObj);
}

const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require("bcrypt");
const User = require('../models/user');
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    console.log("req.body", req.body);
    
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User Added successfully!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    console.log("data", user, emailId, password);
    
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await user.validatePassword(password);
    console.log("isPasswordValid", isPasswordValid, user.password);
    
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful!!!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = authRouter;
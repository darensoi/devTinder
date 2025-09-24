const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const profileRouter = express.Router();
const bcrypt = require("bcrypt");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    console.log("Inside profile view", req);
    
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key]
    });

    await loggedInUser.save();

    res.json({
      message: `Profile updated successfully for ${loggedInUser.firstName}`,
      data: loggedInUser,
    })
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    const loggedInUser = req.user;

    const isPasswordValid = await loggedInUser.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    loggedInUser.password = await bcrypt.hash(newPassword, 10);
    await loggedInUser.save();

    res.send("Password changed successfully for " + loggedInUser.firstName);
  }
  catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
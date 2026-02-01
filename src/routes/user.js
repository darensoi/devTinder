const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const connectionRequest = require('../models/connectionRequest');

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    const connectionRequests = await connectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      'fromUserId',
      'firstName lastName photoUrl about skills'
    )

    res.json({
      message: `Connection requests received for ${loggedInUser.firstName}`,
      data: connectionRequests,
    });
  } 
  catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
module.exports = userRouter;
const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const connectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const USER_SAFE_DATA = 'firstName lastName photoUrl about skills';

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    const connectionRequests = await connectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      'fromUserId',
      USER_SAFE_DATA,
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

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    const connectionRequests = await connectionRequest.find({
      $or: [
        {toUserId: loggedInUser._id, status: "accepted"},
        {fromUserId: loggedInUser._id, status: "accepted"},
      ]
    }).populate(
        "fromUserId",
        USER_SAFE_DATA,
      ).populate(
        "toUserId",
        USER_SAFE_DATA,
      );

    const data = connectionRequests.map( connection => {
      if (connection.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.json({data});
  }
  catch (err) {
    res.status(400).send({message: err.message});
  }
})

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 50);

    const skip = (page - 1) * limit;

    const connectionRequests = await connectionRequest.find({
      $or: [
        {toUserId: loggedInUser._id},
        {fromUserId: loggedInUser._id},
      ]
    });
    
    const hideUsersFromFeed = new Set();

    connectionRequests.forEach( connection => {
      hideUsersFromFeed.add(connection.fromUserId.toString());
      hideUsersFromFeed.add(connection.toUserId.toString());
    });

    const usersFeed = await User.find({
      $and: [
        {_id: {$nin: Array.from(hideUsersFromFeed)}},
        {_id: {$ne: loggedInUser._id}},
      ]
    }).select(USER_SAFE_DATA)
    .skip(skip)
    .limit(limit);

    res.json({data: usersFeed} );
  }
  catch (err) {
    res.status(400).send({message: err.message});
  }
});

module.exports = userRouter;
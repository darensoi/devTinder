const express = require('express');
const { userAuth } = require('../middlewares/auth');
const requestsRouter = express.Router();
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');

requestsRouter.post("/sendConnectionRequest/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    
    const fromUserId = req.user._id;
    
    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value " + status });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser){
      return res.status(404).send({ message: "User does not exist!" });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or : [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });
    
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    if (existingConnectionRequest) {
      return res
        .status(400)
        .send({ error: "Connection request already exists between these users." });
    }

    const data = await connectionRequest.save();

    res.json({
      message: req.user.firstName + " has sent a connection request to " + toUser.firstName,
      data,
    })

  } catch (error) {
    res.status(400).send("Error in sending connection request: " + error.message);
  }
});

module.exports = requestsRouter;
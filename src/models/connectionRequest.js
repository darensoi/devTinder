const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    status: {
        type: String,
        required: true,
        ennum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is not valid status`,
        },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
);

connectionRequestSchema.pre("save", 
  function (next) {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
      throw new Error("fromUserId and toUserId cannot be the same.");
    }
    next();
  }
)

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;

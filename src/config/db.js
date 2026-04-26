const mongoose = require("mongoose");

const db = async () => {
  await mongoose.connect(
    process.env.DB_CONNECTION_SECRET
  );
};

module.exports = db;
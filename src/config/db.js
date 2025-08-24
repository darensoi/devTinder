const mongoose = require("mongoose");

const db = async () => {
  await mongoose.connect(
    "mongodb+srv://darendras:O3DhSWIhnzioYNuc@namastenode.6vbcc.mongodb.net/devTinder"
  );
};

module.exports = db;
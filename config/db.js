const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGOURI);

    console.log(`DataBase Connected at ${connect.connection.host}`);
  } catch (error) {
    console.log("DataBase connection error", error);
    process.exit(1);
  }
};

module.exports = connectDB;


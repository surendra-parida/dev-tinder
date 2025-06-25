const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(
    "mongodb://surendranode:nm0cyTooqx0coKtr@ac-e7hr1ar-shard-00-00.yfgzq65.mongodb.net:27017,ac-e7hr1ar-shard-00-01.yfgzq65.mongodb.net:27017,ac-e7hr1ar-shard-00-02.yfgzq65.mongodb.net:27017/devtinder?ssl=true&replicaSet=atlas-danhvd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SurendraNode"
  );
};
module.exports = connectDB;

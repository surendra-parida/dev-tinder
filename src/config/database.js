const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://surendranode:nm0cyTooqx0coKtr@surendranode.yfgzq65.mongodb.net/devtinder?retryWrites=true&w=majority&appName=SurendraNode"
  );
};
module.exports = connectDB;

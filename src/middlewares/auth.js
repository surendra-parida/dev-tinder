const jwt = require("jsonwebtoken");
const User = require("../model/user");
// Middleware function to authenticate user based on JWT token
const userAuth = async (req, res, next) => {
  try {
    // Extract the token from the cookies in the request
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token is not valid");
    }
    // Verify the token using the secret key, and decode the payload
    const decodedObj = jwt.verify(token, "DEV@Tinder$790");
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    // Attach the found user to the request object to use in the next middleware or route
    req.user = user;
    // Call the next middleware in the stack
    next();
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};
module.exports = {
  userAuth,
};

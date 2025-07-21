const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../model/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token);
    res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPassowordValid = await user.validatePassword(password);
    if (isPassowordValid) {
      const token = await user.getJWT();
      res.cookie("token", token);
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res
      .status(400)
      .send("Please check your email id and password: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logged out successfully");
});

module.exports = authRouter;

const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileData } = require("../utils/validation");
const upload = require("../middlewares/upload");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!validateProfileData(req)) {
        throw new Error("Invalid Edit Request");
      }

      const loggedInUser = req.user;

      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        loggedInUser.photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
      }

      const updatableFields = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "skills",
        "about",
      ];

      updatableFields.forEach((key) => {
        if (req.body[key]) {
          if (key === "skills") {
            try {
              const parsedSkills = JSON.parse(req.body.skills);
              if (!Array.isArray(parsedSkills)) {
                throw new Error("Skills must be an array");
              }
              loggedInUser.skills = parsedSkills;
            } catch {
              throw new Error("Invalid skills format");
            }
          } else {
            loggedInUser[key] = req.body[key];
          }
        }
      });

      await loggedInUser.save();

      res.json({
        message: `${loggedInUser.firstName}, Your profile updated successfully`,
        data: loggedInUser,
      });
    } catch (error) {
      res.status(400).send("Error: " + error.message);
    }
  }
);

module.exports = profileRouter;

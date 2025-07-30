const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../model/connectionRequestSchema");
const userRouter = express.Router();
const User = require("../model/user");
const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "gender",
  "about",
  "skills",
];

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.json({ message: "data fetched successfullt", connectionRequest });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

// userRouter.get("/feed", userAuth, async (req, res) => {
//   try {
//     const loggedInUser = req.user;
//     const page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;
//     limit = limit > 50 ? 50 : limit;
//     const skip = (page - 1) * limit;
//     const connectionRequest = await ConnectionRequest.find({
//       $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
//     }).select("fromUserId toUserId");

//     const hideFromFeed = new Set();

//     connectionRequest.forEach((req) => {
//       hideFromFeed.add(req.fromUserId.toString());
//       hideFromFeed.add(req.toUserId.toString());
//     });

//     const users = await User.find({
//       $and: [
//         { _id: { $nin: Array.from(hideFromFeed) } },
//         { _id: { $ne: loggedInUser._id } },
//       ],
//     })
//       .select(USER_SAFE_DATA)
//       .skip(skip)
//       .limit(limit);

//     res.send(users);
//   } catch (err) {
//     console.error(err);
//     res.status(400).send("ERROR: " + err.message);
//   }
// });
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideFromFeed.add(req.fromUserId.toString());
      hideFromFeed.add(req.toUserId.toString());
    });

    const filter = {
      $and: [
        { _id: { $nin: Array.from(hideFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    };

    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const users = await User.find(filter)
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.send({
      currentPage: page,
      totalPages,
      totalUsers: totalCount,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;

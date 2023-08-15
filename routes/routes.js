const QuestionModel = require("../model/question");
const CategoryModel = require("../model/category");
const UserModel = require("../model/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");
const secretKey = "qwerty"; // Replace with your actual secret key

const express = require("express");

const router = express.Router();

//Post Method
router.post("/post", authMiddleware, async (req, res) => {
  const data = new QuestionModel({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    color: req.body.color,
    date: new Date(),
    userId: mongoose.Types.ObjectId(req.body.userId),
    sharedLevel: req.body.sharedLevel,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all Method
router.get("/getAllQuestion", authMiddleware, async (req, res) => {
  const question = await QuestionModel.find();
  res.status(200).send(question);
});

//post by getQuestionByFilterCategory
router.post(
  "/getQuestionByFilterCategory",
  authMiddleware,
  async (req, res) => {
    const category = req.body.category;
    const pageIndex = req.body.pageIndex;
    const pageSize = req.body.pageSize;
    const sharedLevel = req.body.sharedLevel;
    const userId = req.body.userId;

    try {
      let query = {};

      if (category !== "All") {
        query.category = category;
      }

      if (sharedLevel === "public" || sharedLevel === "private") {
        query.sharedLevel = sharedLevel;

        if (sharedLevel === "private") {
          query.userId = mongoose.Types.ObjectId(userId);
        }
      }

      const pipeline = [
        {
          $match: query, // Replace query with your actual query object
        },
        {
          $skip: pageIndex * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];

      console.log(pipeline);

      const questions = await QuestionModel.aggregate(pipeline);

      const count = await QuestionModel.countDocuments(query);

      res.status(200).send({ questions, count });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//Update by ID Method
router.patch("/updateQuestion", async (req, res) => {
  await QuestionModel.updateMany(
    {},
    { $set: { userId: mongoose.Types.ObjectId("64d8949da5fa50fdea93b7c3") } }
  );
  res.send("Update by user id updated");
});

router.get("/test", async (req, res) => {
  const result = await QuestionModel.aggregate([
    {
      $group: {
        _id: { category: "$category", color: "$color" },
        count: { $sum: 1 },
        privateCount: {
          $sum: { $cond: [{ $eq: ["$sharedLevel", "private"] }, 1, 0] },
        },
        publicCount: {
          $sum: { $cond: [{ $eq: ["$sharedLevel", "public"] }, 1, 0] },
        },
      },
    },
  ]);

  res.json(result);
});

//Delete by ID Method
router.delete("/deleteQuestion/:id", authMiddleware, (req, res) => {
  res.send("Delete by ID API");
});

router.get("/getSubjectCategory", authMiddleware, async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).send(categories);
  } catch (err) {
    res.status(500).send("Error fetching categories.");
  }
});

router.post("/postSubjectCategory", authMiddleware, async (req, res) => {
  const data = new CategoryModel({
    value: req.body.value,
    viewValue: req.body.viewValue,
    color: req.body.color,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/getAnalyticsData/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await QuestionModel.aggregate([
      {
        $group: {
          _id: { category: "$category", color: "$color" },
          count: { $sum: 1 },
          privateCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$sharedLevel", "private"] },
                    { $eq: ["$userId", mongoose.Types.ObjectId(userId)] }, // Replace 'userId' with the actual user ID
                  ],
                },
                1,
                0,
              ],
            },
          },
          publicCount: {
            $sum: { $cond: [{ $eq: ["$sharedLevel", "public"] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$count" },
          privateCount: { $sum: "$privateCount" }, // Sum privateCounts
          publicCount: { $sum: "$publicCount" }, // Sum publicCounts
          results: {
            $push: {
              category: "$_id.category",
              count: "$count",
              color: "$_id.color",
              privateCount: "$privateCount",
              publicCount: "$publicCount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          results: "$results",
          totalCount: 1,
          privateCount: 1,
          publicCount: 1,
        },
      },
    ]);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// sign up user

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Here you might generate a JWT token for authenticated users
    const token = jwt.sign({ email, password }, secretKey, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Here you might generate a JWT token for authenticated users
    const token = jwt.sign({ email, password }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Authentication successful",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;

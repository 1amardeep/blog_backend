const QuestionModel = require("../model/question");
const CategoryModel = require("../model/category");

const express = require("express");

const router = express.Router();

//Post Method
router.post("/post", async (req, res) => {
  const data = new QuestionModel({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    color: req.body.color,
    date: new Date(),
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all Method
router.get("/getAllQuestion", async (req, res) => {
  const question = await QuestionModel.find();
  res.status(200).send(question);
});

//post by getQuestionByFilterCategory
router.post("/getQuestionByFilterCategory", async (req, res) => {
  const category = req.body.category;
  const pageIndex = req.body.pageIndex;
  const pageSize = req.body.pageSize;

  try {
    let query = category === "All" ? {} : { category };

    const questions = await QuestionModel.find(query)
      .skip(pageIndex * pageSize)
      .limit(pageSize);

    const count = await QuestionModel.countDocuments(query);

    res.status(200).send({ questions, count });
  } catch (err) {
    res.status(500).send(err);
  }
});

//Update by ID Method
router.patch("/updateQuestion/:id", (req, res) => {
  res.send("Update by ID API");
});

//Delete by ID Method
router.delete("/deleteQuestion/:id", (req, res) => {
  res.send("Delete by ID API");
});

router.get("/getSubjectCategory", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).send(categories);
  } catch (err) {
    res.status(500).send("Error fetching categories.");
  }
});

router.post("/postSubjectCategory", async (req, res) => {
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

router.get("/getAnalyticsData", async (req, res) => {
  try {
    const result = await QuestionModel.aggregate([
      {
        $group: {
          _id: { category: "$category", color: "$color" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          color: "$_id.color",
          category: "$_id.category",
          count: 1,
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;

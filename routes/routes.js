const BlogModel = require("../model/blog");
const CategoryModel = require("../model/category");

const express = require("express");

const router = express.Router();

//Post Method
router.post("/post", async (req, res) => {
  const data = new BlogModel({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
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
router.get("/getAllBlog", async (req, res) => {
  const blog = await BlogModel.find();
  res.status(200).send(blog);
});

//Get by ID Method
router.get("/getBlogByCategory/:category", async (req, res) => {
  try {
    const category = req.params.category;
    let blogs;
    if (category === "All") {
      blogs = await BlogModel.find();
    } else {
      blogs = await BlogModel.find({
        category,
      });
    }
    res.status(200).send(blogs);
  } catch (err) {
    res.status(500).send("Error fetching blogs by category.");
  }
});

//Update by ID Method
router.patch("/updateBlog/:id", (req, res) => {
  res.send("Update by ID API");
});

//Delete by ID Method
router.delete("/deleteBlog/:id", (req, res) => {
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
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;

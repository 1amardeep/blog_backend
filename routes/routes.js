const Model = require("../model/model");

const express = require("express");

const router = express.Router();

//Post Method
router.post("/post", async (req, res) => {
  const data = new Model({
    title: req.body.title,
    description: req.body.description,
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
  const blog = await Model.find();
  res.status(200).send(blog);
});

//Get by ID Method
router.get("/getOneBlog/:id", (req, res) => {
  res.send(req.params.id);
});

//Update by ID Method
router.patch("/updateBlog/:id", (req, res) => {
  res.send("Update by ID API");
});

//Delete by ID Method
router.delete("/deleteBlog/:id", (req, res) => {
  res.send("Delete by ID API");
});

module.exports = router;

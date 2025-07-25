const express = require("express");
const router = express.Router();
const { bucket } = require("../config/storage");

// GET /reviews - Fetch all reviews
router.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "reviews/" });
    const reviews = await Promise.all(
      files.map(async (file) => {
        const content = await file.download();
        return JSON.parse(content);
      })
    );

    res.json({
      reviews: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST /reviews - Create a new review
router.post("/", async (req, res) => {
  try {
    const { name, feedback, rating } = req.body;

    if (!name || !feedback || !rating) {
      return res.status(400).json({
        message: "Missing required fields: name, feedback, rating",
      });
    }

    const review = {
      id: Date.now().toString(),
      name,
      feedback,
      rating: parseInt(rating),
      createdAt: new Date().toISOString(),
    };

    await bucket.file(`reviews/${review.id}.json`).save(JSON.stringify(review));

    res.status(201).json({
      message: "Review saved successfully",
      review: review,
    });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ message: "Failed to save review" });
  }
});

module.exports = router;

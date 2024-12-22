import express from "express";
const router = express.Router();

/* GET users listing. */
router.get("/api/v1", function (req, res, next) {
  res.send("respond with a resource");
});

export default router;

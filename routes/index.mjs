import express from "express";
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("index");
});

console.log(test);

export default router;

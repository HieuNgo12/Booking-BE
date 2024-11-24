import express from "express";
const router = express.Router();

/* GET users listing. */
router.post("/api/v1/test", function (req, res, next) {
  res.cookie("refreshToken", "abcdef", {
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "None",
    maxAge: 3600000,
  });

  res.status(200).json({
    message: "Cookie set successfully!",
    data: { refreshToken: "abcdef" },
  });
});

export default router;

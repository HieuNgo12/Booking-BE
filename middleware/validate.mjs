import express from "express";
import UserModel from "../models/UsersModel.mjs";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import AdminModel from "../models/AdminModel.mjs";

const isLogInUser = async (req, res, next) => {
  const checkRole = await UserModel.findById(req.user.id);
  if (checkRole.role === "user") {
    next();
  } else {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
};

const isLogInAdmin = async (req, res, next) => {
  const checkRole = await AdminModel.findById(req.user.id);
  if (checkRole.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Forbidden. Only for admin",
    });
  }
};

const isLogInSuper = async (req, res, next) => {
  const checkRole = await UserModel.findById(req.user.id);
  if (userRole.role === "super") {
    next();
  } else {
    return res.status(403).send("Forbidden");
  }
};

const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    jwt.verify(token, process.env.KEY_JWT, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({
          message: "Unauthorized - Invalid or expired token",
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwtDecode(refreshToken);
    const checkInfo = await UserModel.findById(decoded.id);

    if (!checkInfo) {
      return res.status(400).json({
        message: "User is not found! Please log in again!",
      });
    }

    const newToken = jwt.sign(
      {
        id: checkInfo.id,
        email: checkInfo.email,
        isEmailVerified: checkInfo.isEmailVerified,
        role: checkInfo.role,
      },
      process.env.KEY_JWT,
      {
        expiresIn: "5m",
      }
    );

    res.cookie("accessToken", newToken, {
      httpOnly: true,
      path: "/",
      // secure: false,
      // sameSite: "None",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newToken });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const refreshTokenAdmin = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwtDecode(refreshToken);
    const checkInfo = await AdminModel.findById(decoded.id);

    if (!checkInfo) {
      return res.status(400).json({
        message: "User is not found! Please log in again!",
      });
    }

    const newToken = jwt.sign(
      {
        id: checkInfo.id,
        email: checkInfo.email,
        isEmailVerified: checkInfo.isEmailVerified,
        role: checkInfo.role,
      },
      process.env.KEY_JWT,
      {
        expiresIn: "5m",
      }
    );

    res.cookie("accessToken", newToken, {
      httpOnly: true,
      path: "/",
      // secure: false,
      // sameSite: "None",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newToken });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const refreshTokenVer2 = async (req, res, next) => {
  try {
    const { refreshToken, accessToken } = req.cookies;

    // const token =
    //   req.headers["authorization"] &&
    //   req.headers["authorization"].split(" ")[1];
    // const dateNow = new Date();

    const decoded = jwtDecode(accessToken);
    const checkInfo = await UserModel.findById(decoded.id);

    if (!checkInfo) {
      return res.status(400).json({
        message: "User is not found! Please log in again!",
      });
    }

    if (decoded.exp < dateNow.getTime() / 1000) {
      const newToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
          isEmailVerified: decoded.isEmailVerified,
          role: decoded.role,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("accessToken", newToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "None",
        maxAge: 3600000,
      });

      return res.status(200).json({ accessToken: newToken });
    } else {
      res.json({ accessToken: token });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  validateToken,
  isLogInUser,
  isLogInAdmin,
  isLogInSuper,
  refreshToken,
  refreshTokenAdmin,
};

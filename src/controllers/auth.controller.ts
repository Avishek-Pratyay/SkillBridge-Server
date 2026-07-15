import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userCollection } from "../config/db";

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      photoURL,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required.",
      });
    }

    const existingUser = await userCollection.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = {
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || "",

      // New
      role:
        role === "instructor"
          ? "instructor"
          : "student",

      // Instructor must subscribe later
      subscription: false,

      createdAt: new Date(),
    };

    const result =
      await userCollection.insertOne(user);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const user = await userCollection.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatched =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",

      token,

      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        subscription:
          user.subscription ?? false,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      photoURL,

    } = req.body;

    let user = await userCollection.findOne({
      email,
    });

    if (!user) {
      const newUser = {
        name,
        email,
        password: "",
        photoURL: photoURL || "",
        role: "student",
        subscription: false,
        createdAt: new Date(),
      };

      await userCollection.insertOne(newUser);

      user = newUser;
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        subscription: user.subscription ?? false,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Google Login Failed",
    });

  }
};
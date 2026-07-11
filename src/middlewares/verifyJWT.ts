import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid Token",
        });
      }

      req.user = decoded;
      next();
    }
  );
};

export default verifyJWT;
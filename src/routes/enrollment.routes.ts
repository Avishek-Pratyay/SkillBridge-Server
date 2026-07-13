import express from "express";

import {
  enrollCourse,
  getMyEnrollments,
} from "../controllers/enrollment.controller";import verifyJWT from "../middlewares/verifyJWT";

const router = express.Router();

// Student enroll
router.post("/", verifyJWT, enrollCourse);
router.get(
  "/my-enrollments",
  verifyJWT,
  getMyEnrollments
);

export default router;
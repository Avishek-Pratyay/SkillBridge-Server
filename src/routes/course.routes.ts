import { Router } from "express";
import {
  addCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getMyCourses,
  updateCourse,
} from "../controllers/course.controller";

import verifyJWT from "../middlewares/verifyJWT";

const router = Router();

router.get("/", getCourses);
router.get("/my-courses", verifyJWT, getMyCourses);

router.get("/:id", getCourseById);


router.post("/", verifyJWT, addCourse);

router.delete("/:id", verifyJWT, deleteCourse);
router.put("/:id", verifyJWT, updateCourse);

export default router;
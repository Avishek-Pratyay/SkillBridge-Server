import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import {
  enrollmentCollection,
  courseCollection,
} from "../config/db";

export const enrollCourse = async (req: any, res: Response) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    // Find the course
    const course = await courseCollection.findOne({
      _id: new ObjectId(courseId),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Prevent instructor from enrolling in own course
    if (course.createdBy === req.user.email) {
      return res.status(400).json({
        success: false,
        message: "You cannot enroll in your own course.",
      });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await enrollmentCollection.findOne({
      courseId,
      studentEmail: req.user.email,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You have already enrolled in this course.",
      });
    }

    const enrollment = {
      courseId,
      courseTitle: course.title,
      instructorEmail: course.createdBy,
      studentEmail: req.user.email,
      price: course.price,
      paymentStatus: "pending",
      createdAt: new Date(),
    };

    const result = await enrollmentCollection.insertOne(enrollment);

    res.status(201).json({
      success: true,
      message: "Enrollment created successfully.",
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

export const getMyEnrollments = async (
  req: any,
  res: Response
) => {
  try {
    const enrollments =
      await enrollmentCollection
        .find({
          studentEmail: req.user.email,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to load enrollments",
    });
  }
};
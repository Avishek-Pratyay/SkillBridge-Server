import { Request, Response } from "express";
import Stripe from "stripe";
import {
  courseCollection,
  enrollmentCollection,
  paymentCollection,
} from "../config/db";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPaymentIntent = async (
  req: any,
  res: Response
) => {
  try {
    const { courseId } = req.body;

    const course = await courseCollection.findOne({
      _id: new ObjectId(courseId),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: Math.round(Number(course.price) * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      course,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
};

export const confirmEnrollment = async (
  req: any,
  res: Response
) => {
  try {
    const {
      courseId,
      paymentIntentId,
      amount,
    } = req.body;

    const email = req.user.email;

const already =
  await enrollmentCollection.findOne({
    courseId: new ObjectId(courseId),
    studentEmail: email,
  });

    if (already) {
      return res.json({
        success: true,
      });
    }

await enrollmentCollection.insertOne({
  courseId: new ObjectId(courseId),
  studentEmail: email,
  enrolledAt: new Date(),
});

await paymentCollection.insertOne({
  paymentIntentId,
  courseId: new ObjectId(courseId),
  studentEmail: email,
  amount,
  paidAt: new Date(),
});

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
    });
  }
};
export const getMyEnrollments = async (
  req: any,
  res: Response
) => {
  try {

    const email = req.user.email;

    const courses =
      await enrollmentCollection
        .aggregate([
          {
            $match: {
              studentEmail: email,
            },
          },
          {
            $lookup: {
              from: "courses",
              localField: "courseId",
              foreignField: "_id",
              as: "course",
            },
          },
          {
            $unwind: "$course",
          },
          {
            $replaceRoot: {
              newRoot: "$course",
            },
          },
        ])
        .toArray();

    res.json({
      success: true,
      data: courses,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
    });

  }
};
export const getMyPayments = async (
  req: any,
  res: Response
) => {
  try {
    const email = req.user.email;

    const payments = await paymentCollection
      .aggregate([
        {
          $match: {
            studentEmail: email,
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: "$course",
        },
        {
          $project: {
            _id: 1,
            paymentIntentId: 1,
            amount: 1,
            paidAt: 1,
            courseTitle: "$course.title",
          },
        },
        {
          $sort: {
            paidAt: -1,
          },
        },
      ])
      .toArray();

    res.json({
      success: true,
      data: payments,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to load payment history",
    });
  }
};
export const checkEnrollment = async (
  req: any,
  res: Response
) => {
  try {
    const email = req.user.email;
    const { courseId } = req.params;

const enrollment =
  await enrollmentCollection.findOne({
    studentEmail: email,
    courseId: new ObjectId(courseId),
  });

    res.json({
      success: true,
      enrolled: !!enrollment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      enrolled: false,
    });
  }
};
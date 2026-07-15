import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  courseCollection,
  enrollmentCollection,
  paymentCollection,
} from "../config/db";
export const getCourses = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      category,
      sort,
      page = "1",
      limit = "8",
    } = req.query as any;

    const query: any = {};

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      query.category = category;
    }

    const sortOption: any = {};

    if (sort === "priceLow") sortOption.price = 1;

    if (sort === "priceHigh") sortOption.price = -1;

    if (sort === "newest") sortOption.createdAt = -1;

    const currentPage = Number(page);

    const perPage = Number(limit);

    const total = await courseCollection.countDocuments(query);

    const courses = await courseCollection
      .find(query)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .toArray();

    res.json({
      success: true,
      total,
      currentPage,
      totalPages: Math.ceil(total / perPage),
      data: courses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
    });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await courseCollection.findOne({
_id: new ObjectId(req.params.id as string),
});

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

export const addCourse = async (req: any, res: Response) => { 
     try {
    const course = {
  ...req.body,
  createdBy: req.user.email,
  createdAt: new Date(),
};
    const result = await courseCollection.insertOne(course);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to add course",
    });
  }
};

export const deleteCourse = async (req: any, res: Response) => {
  try {
    const result = await courseCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user.email,
    });

    if (result.deletedCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course.",
      });
    }

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
export const updateCourse = async (req: any, res: Response) => {
  try {
    const updatedData = { ...req.body };

    // Never allow these fields to be updated
    delete updatedData._id;
    delete updatedData.createdBy;
    delete updatedData.createdAt;

    const result = await courseCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
        createdBy: req.user.email,
      },
      {
        $set: updatedData,
      }
    );
    

    if (result.matchedCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course.",
      });
    }

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log("UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};
export const getMyCourses = async (
  req: any,
  res: Response
) => {
  try {
    const email = req.user.email;

    const courses = await courseCollection
      .find({
        createdBy: email,
      })
      .toArray();

    const updatedCourses = await Promise.all(
      courses.map(async (course) => {
        const totalStudents =
          await enrollmentCollection.countDocuments({
            courseId: course._id,
          });

        const payments =
          await paymentCollection
            .find({
              courseId: course._id,
            })
            .toArray();

        const totalRevenue = payments.reduce(
          (sum: number, payment: any) =>
            sum + Number(payment.amount || 0),
          0
        );

        return {
          ...course,
          totalStudents,
          totalRevenue,
        };
      })
    );

    res.json({
      success: true,
      data: updatedCourses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your courses",
    });
  }
};
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { courseCollection } from "../config/db";

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

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const result = await courseCollection.deleteOne({
_id: new ObjectId(req.params.id as string),
});

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await courseCollection.updateOne(
      { _id: new ObjectId(req.params.id as string), },
      {
        $set: updatedData,
      }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};
export const getMyCourses = async (req: any, res: Response) => {
  try {
    const email = req.user.email;

    const courses = await courseCollection
      .find({ createdBy: email })
      .toArray();

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your courses",
    });
  }
};
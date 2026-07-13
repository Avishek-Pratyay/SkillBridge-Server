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
        courseId,
        studentEmail: email,
      });

    if (already) {
      return res.json({
        success: true,
      });
    }

    await enrollmentCollection.insertOne({
      courseId,
      studentEmail: email,
      enrolledAt: new Date(),
    });

    await paymentCollection.insertOne({
      paymentIntentId,
      courseId,
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
  req:any,
  res:Response
)=>{

  try{

    const email =
      req.user.email;


    const enrollments =
      await enrollmentCollection
      .find({
        studentEmail:email
      })
      .toArray();



    const courses =
      await Promise.all(

        enrollments.map(
          async(item)=>{

            const course =
              await courseCollection.findOne({
                _id:
                new ObjectId(item.courseId)
              });


            return {
              ...course,
              enrolledAt:
              item.enrolledAt
            };

          }
        )

      );



    res.json({

      success:true,

      data:courses

    });



  }catch(error){

    res.status(500).json({

      success:false

    });

  }

};
export const getMyPayments = async(
 req:any,
 res:Response
)=>{

try{

const payments =
await paymentCollection
.find({
 studentEmail:req.user.email
})
.toArray();


res.json({

success:true,

data:payments

});


}catch(error){

res.status(500).json({

success:false

});

}

};
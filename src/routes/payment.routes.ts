import { Router } from "express";

import verifyJWT from "../middlewares/verifyJWT";

import {
  createPaymentIntent,
  confirmEnrollment,
  getMyEnrollments,
  getMyPayments,
  checkEnrollment,
} from "../controllers/payment.controller";

const router = Router();

router.post(
  "/create-payment-intent",
  verifyJWT,
  createPaymentIntent
);

router.post(
  "/confirm",
  verifyJWT,
  confirmEnrollment
);
router.get(
"/my-enrollments",
verifyJWT,
getMyEnrollments
);

router.get(
  "/check-enrollment/:courseId",
  verifyJWT,
  checkEnrollment
);
router.get(
"/my-payments",
verifyJWT,
getMyPayments
);

export default router;
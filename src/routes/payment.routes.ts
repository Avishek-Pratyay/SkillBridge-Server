import { Router } from "express";

import verifyJWT from "../middlewares/verifyJWT";

import {
createPaymentIntent,
confirmEnrollment,
getMyEnrollments,
getMyPayments
}
from "../controllers/payment.controller";

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
"/my-payments",
verifyJWT,
getMyPayments
);

export default router;
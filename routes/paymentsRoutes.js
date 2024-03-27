const express = require("express");
const router = express.Router();
// Import controllers
const paymentsController = require("../Controllers/paymentController");
const { payNow, callBack } = paymentsController;

router.post("/paynow", payNow);
router.post("/callback", callBack);
module.exports = router;

const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, invoiceController.getInvoices);
router.get("/:id", auth, invoiceController.getInvoice);
router.post("/", auth, invoiceController.createInvoice);
router.put("/:id", auth, invoiceController.updateInvoice);
router.delete("/:id", auth, invoiceController.deleteInvoice);

module.exports = router;
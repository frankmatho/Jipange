const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, clientController.getClients);
router.get("/:id", auth, clientController.getClient);
router.post("/", auth, clientController.createClient);
router.put("/:id", auth, clientController.updateClient);
router.delete("/:id", auth, clientController.deleteClient);

module.exports = router;
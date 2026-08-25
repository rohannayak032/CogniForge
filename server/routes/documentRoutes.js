const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadDocument } = require("../controllers/documentController");

const router = express.Router();

router.post("/documents", upload, uploadDocument);

module.exports = router;
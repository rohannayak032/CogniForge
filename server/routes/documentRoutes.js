const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadDocument, searchDocuments } = require("../controllers/documentController");

const router = express.Router();

router.post("/documents", upload, uploadDocument);
router.post("/documents/search", searchDocuments);

module.exports = router;
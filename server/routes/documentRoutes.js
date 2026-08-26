const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadDocument, searchDocuments, askDocuments, listDocuments, deleteDocument } = require("../controllers/documentController");

const router = express.Router();

router.post("/documents", upload, uploadDocument);
router.get("/documents/:userID", listDocuments);
router.delete("/documents/:documentID", deleteDocument);
router.post("/documents/search", searchDocuments);
router.post("/documents/ask", askDocuments);

module.exports = router;
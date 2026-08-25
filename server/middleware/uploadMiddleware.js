const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    }
});

function uploadPdf(req, res, next) {
    upload.single("file")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "PDF uploads must be 10 MB or smaller"
            });
        }

        return res.status(400).json({
            success: false,
            message: "Unable to process the uploaded file"
        });
    });
}

module.exports = uploadPdf;
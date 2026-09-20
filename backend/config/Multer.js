const multer = require("multer");

const storage = multer.diskStorage({});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

module.exports = upload;

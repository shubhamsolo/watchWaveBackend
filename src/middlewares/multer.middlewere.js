import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

      cb(null, file.originalname)
    }
  })

  export const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB file size limit

  

// const path = require("path");
// const express = require("express");
// const multer = require("multer");
// const router = express.Router();


// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename(req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
//     )
//   },
// })

// function checkFileType(file, cb) {
//   const filetypes = /jpg|jpeg|png/
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
//   const mimetype = filetypes.test(file.mimetype)

//   if (extname && mimetype) {
//     return cb(null, true)
//   } else {
//     cb('Images only!')
//   }
// }

// const upload = multer({
//   storage,
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb)
//   },
// })

// router.post('/', upload.single('image'), (req, res) => {
//   // res.send(`/${req.file.path}`)
//   if(req.file){
//     res.status(200)
//     res.json({path: `/${req.file.path}`})
//   }else{
//     res.status(400)
//     res.json({error: 'File not found'})
//   }
// })

// module.exports = router;


const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");


cloudinary.config({
  cloud_name: "hyderly",
  api_key: "946177497487527",
  api_secret: "u2LnG7l6Eu3dzQH6wGopbqjCyko",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "goFlowers",
  },
});

const upload = multer({ storage: storage });


router.post("/", upload.single("image"), async (req, res) => {
  // return res.json({ path: req.file.path });
  if(req.file){
        res.status(200)
        res.json({path: req.file.path})
      }else{
        res.status(400)
        res.json({error: 'File not found'})
      }
});

router.post("/multi", upload.array("image", 10), async (req, res) => {
  // return res.json({ path: req.file.path });
  console.log(req.files);
  if(req.files){
        res.status(200)
        res.json({paths: req.files.map((file) => file.path)})
      }else{
        res.status(400)
        res.json({error: 'File not found'})
      }
});


module.exports = router;



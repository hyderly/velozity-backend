const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Autherization
const {protectRoute} = require("../middlewares/authentication.js");


cloudinary.config({
  cloud_name: "hyderly",
  api_key: "946177497487527",
  api_secret: "u2LnG7l6Eu3dzQH6wGopbqjCyko",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "velozity",
  },
});

const upload = multer({ storage: storage });


router.post("/", protectRoute, upload.single("image"), async (req, res) => {
  // return res.json({ path: req.file.path });
  if(req.file){
        res.status(200)
        res.json({path: req.file.path})
      }else{
        res.status(400)
        res.json({error: 'File not found'})
      }
});

router.post("/multi", protectRoute, upload.array("image", 10), async (req, res) => {
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



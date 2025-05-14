import { Router } from "express";
import multer from "multer";

// controllers
import { addNewImageToS3 } from "../controllers/AddNewImageToS3.js";

const router = Router();

// Configura multer para usar memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadFields = upload.fields([{ name: "Images" }]);
console.log(uploadFields);

router.post("/uploadImages", uploadFields, addNewImageToS3);

export default router;

import {
  uploadImageToS3Bucket,
  uploadBatchImagesToS3,
} from "./awsFunctions.js";

export const addNewImageToS3 = async (req, res) => {
  // validacion para que traiga todas la images
  const eventImageList = await processUploadImagesForEvent(req.files.Images);

  try {
    return res.status(200).json(eventImageList);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const processUploadImagesForEvent = async (files) => {
  try {
    if (files.length === 1) {
      const uploadedImg = await uploadImageToS3Bucket(
        files[0].buffer,
        files[0].originalname
      );
      if (uploadedImg.error) {
        throw new Error("Solo puedes subir imágenes en formato JPG o PNG");
      }
      return {
        multipleImages: [uploadedImg.url],
        status: 200,
        imagen: "single",
      };
    } else if (files.length > 1) {
      const multipleImages = await uploadBatchImagesToS3(files);
      if (multipleImages.includes(undefined)) {
        throw new Error("Solo puedes subir imágenes en formato JPG o PNG");
      }
      return { multipleImages, status: 200, imagen: "multiple" };
    }
  } catch (error) {
    return { error: error.message };
  }
};

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "dotenv";
config();

const client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.ACCES_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const validateFile = (imgName) => {
  return (
    !imgName.endsWith(".png") &&
    !imgName.endsWith(".PNG") &&
    !imgName.endsWith(".jpg") &&
    !imgName.endsWith(".JPG") &&
    !imgName.endsWith(".jpeg") &&
    !imgName.endsWith(".JPEG")
  );
};

function normalizarNombreArchivo(originalName) {
  const extension = originalName.split(".").pop() || "jpg";

  const baseName = originalName
    .replace(/\.[^/.]+$/, "") // quitar extensión
    .toLowerCase()
    .normalize("NFD") // quitar acentos
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos (parte 2)
    .replace(/[^a-z0-9]+/g, "-") // reemplazar cualquier cosa rara por guiones
    .replace(/(^-|-$)/g, ""); // quitar guiones al inicio/final

  return `${baseName}.${extension}`;
}

export async function uploadImageToS3Bucket(bufferFile, imgName) {
  try {
    if (validateFile(imgName)) {
      throw new Error("Solo puedes subir imágenes en formato JPG o PNG");
    }
    const nombreImgNormalized = normalizarNombreArchivo(imgName);
    const key = `propiedadessaltillo/${nombreImgNormalized}`;

    const input = {
      Body: bufferFile,
      Bucket: "propiedadessaltillo",
      Key: key,
      ContentType: "image/jpeg", // Especifica el tipo de contenido aquí
    };

    const command = new PutObjectCommand(input);
    const awsResponse = await client.send(command);
    const url = `https://propiedadessaltillo.s3.us-east-2.amazonaws.com/${key}`;

    const response = {
      message: awsResponse.$metadata,
      url,
    };
    return response;
  } catch (error) {
    return { error };
  }
}

export async function uploadBatchImagesToS3(fileList) {
  try {
    let imageListUrls = [];

    for (let i = 0; i < fileList.length; i++) {
      const uploadPromises = fileList.map(async (file) => {
        const imagenSubida = await uploadImageToS3Bucket(
          file.buffer,
          file.originalname
        );
        return imagenSubida.url; // Devuelve solo el link para el array final
      });

      const batchResults = await Promise.all(uploadPromises);
      imageListUrls = batchResults;
    }
    return imageListUrls;
  } catch (error) {
    return { error: error.message };
  }
}

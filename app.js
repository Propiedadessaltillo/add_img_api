import express from "express";
import helmet from "helmet";
import cors from "cors";

import router from "./routes/images.js";

const app = express();
// First commit for porpiedades saltillo
// allow cors
app.use(cors());
// prase json incoming req
app.use(express.json());
// extra security
app.use(helmet());

//routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.json("hola desde el server");
});

export default app;

// src/middleware/corsOptions.ts
import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "http://localhost:5173", // alamat front end kamu
  credentials: true, // biar cookie bisa dikirim
};

export default corsOptions;

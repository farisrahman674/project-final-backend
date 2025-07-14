// src/index.ts
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth-route";
import productRouter from "./routes/product-route";
import orderRoute from "./routes/order-route";
import pointRoutes from "./routes/point-route";
import profileRoute from "./routes/profile-route";
import cartroute from "./routes/cart-route";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRoute);
app.use("/point", pointRoutes);
app.use("/profile", profileRoute);
app.use("/cart", cartroute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

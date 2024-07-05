import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credential: true, // cors setting
  })
);

app.use(express.json({ limit: "16kb" })); //limiting json

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // extended object object in object

app.use(express.static("public")); // image icon

app.use(cookieParser()); // server can access ui cookies to manage it

export { app };

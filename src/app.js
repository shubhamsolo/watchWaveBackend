import express from "express";
import cookieParser from "cookie-parser"; // Access and set cookies
import cors from "cors";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import userRouter from "./routes/user.routes.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: ["https://gleeful-sawine-4b61b7.netlify.app"], // Replace with your specific origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowing OPTIONS for preflight
  credentials: true // Allows cookies and credentials
}));
// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files
app.use(express.static("public"));

// Middleware to parse cookies
app.use(cookieParser());

// Example route protected by JWT verification
app.use('/some-route', verifyJWT, (req, res) => {
    res.send("Protected route accessed!");
});

// Routes
app.use("/api/v1/users", userRouter);

// Export the app
export { app };

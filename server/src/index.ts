import express, { Express, Request, Response } from "express";
import leadRoutes from "./route/leadRoutes";
import notesRoutes from "./route/notesRoute";
import historyRoutes from "./route/historyRoutes";
import leadFollowRoutes from "./route/leadFollowRoutes";
import salesManRoutes from "./route/salesRoute";
import salesmanBookingRoutes from "./route/salesmanBookingRoutes";
import customerDetailsRoutes from "./route/insurance/customerDetailsRoute";
import leadBookingRoutes from "./route/leadBookingRoute";
import authRoutes from "./route/authRoutes";
import fileRoutes from "./route/fileRoutes";
import exportRoutes from "./route/exportRoutes";
import { sendResponse } from "../src/utils/response";
import { messages } from "./constants/message";
import cors from 'cors';

const app: Express = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());
app.use(express.urlencoded());

// Existing AutoCredits routes
app.use("/api/lead", leadRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/histories", historyRoutes);
app.use("/api/lead/follow", leadFollowRoutes);
app.use("/api/salesman", salesManRoutes);
app.use("/api/salesman/booking", salesmanBookingRoutes);
app.use("/api/details", customerDetailsRoutes);
app.use("/api/lead/booking", leadBookingRoutes);

// New microservice integration routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/export", exportRoutes);

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, res.statusCode, true, messages.defaultmessage);
  // res.status(res.statusCode).json({
  //   status: "Sucess",
  //   message: "Server running sucessfully!",
  //   error: false,
  // });
});

export default app;

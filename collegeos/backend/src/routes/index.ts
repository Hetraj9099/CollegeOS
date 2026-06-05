import { Router } from "express";
import { authRoutes } from "../modules/auth/routes.js";
import { semestersRoutes } from "../modules/semesters/routes.js";
import { subjectsRoutes } from "../modules/subjects/routes.js";
import { gradesRoutes } from "../modules/grades/routes.js";
import { tasksRoutes } from "../modules/tasks/routes.js";
import { calendarRoutes } from "../modules/calendar/routes.js";
import { timetableRoutes } from "../modules/timetable/routes.js";
import { studyRoutes } from "../modules/study/routes.js";
import { analyticsRoutes } from "../modules/analytics/routes.js";
import { cgpaRoutes } from "../modules/cgpa/routes.js";
import { authMiddleware } from "../middleware/auth.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use(authMiddleware);
apiRouter.use("/semesters", semestersRoutes);
apiRouter.use("/subjects", subjectsRoutes);
apiRouter.use("/grades", gradesRoutes);
apiRouter.use("/tasks", tasksRoutes);
apiRouter.use("/calendar", calendarRoutes);
apiRouter.use("/timetable", timetableRoutes);
apiRouter.use("/study", studyRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/cgpa", cgpaRoutes);

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";

import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { courseRoutes } from "./routes/course.routes";
import { assignmentRoutes } from "./routes/assignment.routes";
import { submissionRoutes } from "./routes/submission.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";

const PORT = parseInt(process.env.PORT || "3000");

const app = new Elysia()
  .use(
    cors({
      origin: () => true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "lms-rbac-edlink-secret-key-2024",
    })
  )
  // Global error handler
  .onError(({ code, error, set }) => {
    const errMessage = error instanceof Error ? error.message : String(error);
    
    if (errMessage === "Authentication required" || errMessage === "Invalid or expired token") {
      set.status = 401;
      return { success: false, message: errMessage };
    }
    if (errMessage === "FORBIDDEN") {
      set.status = 403;
      return { success: false, message: "Access denied" };
    }
    if (errMessage === "COURSE_FORBIDDEN") {
      set.status = 403;
      return { success: false, message: "You are not a member of this course" };
    }
    if (errMessage === "COURSE_ROLE_FORBIDDEN") {
      set.status = 403;
      return { success: false, message: "Insufficient role in this course" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { success: false, message: "Validation error", errors: errMessage };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Route not found" };
    }
    console.error("Unhandled error:", error);
    set.status = 500;
    return { success: false, message: "Internal server error" };
  })
  // Health check
  .get("/", () => ({
    success: true,
    message: "LMS RBAC Backend API is running",
    version: "1.0.0",
  }))
  // API routes
  .group("/api", (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(courseRoutes)
      .use(assignmentRoutes)
      .use(submissionRoutes)
      .use(dashboardRoutes)
  )
  .listen(PORT);

console.log(`🚀 LMS RBAC Backend is running at http://localhost:${PORT}`);
console.log(`📝 API routes available at http://localhost:${PORT}/api`);

export type App = typeof app;
export default app;

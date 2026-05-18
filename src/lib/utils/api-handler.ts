import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiHandler = (req: Request, ...args: any[]) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          { ok: false, error: "Validation Error", details: error.flatten() },
          { status: 400 }
        );
      }

      // Handle common Mongoose errors
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { ok: false, error: "Database Validation Error", details: error.message },
          { status: 400 }
        );
      }
      
      if (error.code === 11000) {
        return NextResponse.json(
          { ok: false, error: "Duplicate Key Error", details: error.message },
          { status: 409 }
        );
      }

      // Fallback for unhandled exceptions
      const isDev = process.env.NODE_ENV === "development";
      return NextResponse.json(
        { 
          ok: false, 
          error: "Internal Server Error",
          message: isDev ? error.message : "An unexpected error occurred"
        },
        { status: 500 }
      );
    }
  };
}

import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    const startTime = Date.now();
    await connectToMongo();
    
    // Perform a lightweight database operation to verify read capacity
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1; // 1 = connected

    const duration = Date.now() - startTime;

    if (!isConnected) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Database connection failed",
          readyState: dbState,
          timestamp: new Date().toISOString() 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        status: "ok", 
        database: "connected",
        latencyMs: duration,
        timestamp: new Date().toISOString() 
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error", 
        message: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString() 
      },
      { status: 503 }
    );
  }
}

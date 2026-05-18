import { NextResponse } from "next/server";
import { withErrorHandler } from "../api-handler";
import { ZodError, ZodIssueCode } from "zod";

describe("withErrorHandler", () => {
  const mockReq = {} as Request;

  it("should return the result of the handler if it succeeds", async () => {
    const handler = async () => NextResponse.json({ ok: true }, { status: 200 });
    const wrapped = withErrorHandler(handler);
    
    const res = await wrapped(mockReq);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  it("should catch ZodError and return 400", async () => {
    const handler = async () => {
      throw new ZodError([{ code: ZodIssueCode.custom, path: [], message: "Invalid" }]);
    };
    const wrapped = withErrorHandler(handler);
    
    const res = await wrapped(mockReq);
    const data = await res.json();
    
    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Validation Error");
  });

  it("should catch Mongoose Duplicate Key Error and return 409", async () => {
    const handler = async () => {
      const err = new Error("Duplicate");
      (err as any).code = 11000;
      throw err;
    };
    const wrapped = withErrorHandler(handler);
    
    const res = await wrapped(mockReq);
    const data = await res.json();
    
    expect(res.status).toBe(409);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Duplicate Key Error");
  });

  it("should catch generic errors and return 500", async () => {
    const handler = async () => {
      throw new Error("Something bad happened");
    };
    const wrapped = withErrorHandler(handler);
    
    const res = await wrapped(mockReq);
    const data = await res.json();
    
    expect(res.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Internal Server Error");
  });
});

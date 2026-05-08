import { NextResponse } from "next/server";

export function ApiResponse(statusCode: number, data: any = null, message: string = "Success") {
  return NextResponse.json(
    {
      success: statusCode < 400,
      message,
      data,
    },
    { status: statusCode }
  );
}


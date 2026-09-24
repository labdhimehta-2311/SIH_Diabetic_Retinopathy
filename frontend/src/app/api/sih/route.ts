import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      status: "active",
      featuresCount: 25,
      version: "2.0.0",
      architecture: "Decoupled Enhancement Adapter Layer"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      caseId: body.sessionId || "SESSION_SIH",
      message: "SIH features adapter processed successfully."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

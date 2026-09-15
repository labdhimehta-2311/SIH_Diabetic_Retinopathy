import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Forward the payload to your Python FastAPI bridge
    const bridgeResponse = await fetch('http://127.0.0.1:8000/infer', {
      method: 'POST',
      body: formData,
    });

    if (!bridgeResponse.ok) {
      throw new Error(`Python Bridge returned status ${bridgeResponse.status}`);
    }

    const aiResult = await bridgeResponse.json();
    return NextResponse.json(aiResult);
    
  } catch (error: any) {
    console.error('Inference Bridge Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Pipeline communication failure' },
      { status: 500 }
    );
  }
}
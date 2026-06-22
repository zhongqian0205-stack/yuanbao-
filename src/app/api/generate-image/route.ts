import { NextRequest, NextResponse } from "next/server";

const STEPFUN_API_URL = "https://api.stepfun.com/v1/images/generations";
const API_KEY = process.env.STEPFUN_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "Stepfun API token not configured" },
        { status: 500 }
      );
    }

    console.log("Calling Stepfun API with prompt:", prompt);

    // 调用阶跃星辰图像生成 API
    const response = await fetch(STEPFUN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "step-image-edit-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Stepfun API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to generate image" },
        { status: response.status }
      );
    }

    // 提取图像 URL (阶跃星辰返回格式)
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error("No image URL in response:", data);
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
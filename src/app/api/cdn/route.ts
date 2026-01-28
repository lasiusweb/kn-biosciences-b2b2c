// CDN API Routes for Media Management
import { NextRequest, NextResponse } from "next/server";
import { cdnManager } from "@/lib/cdn/cdn-manager";

// Upload media file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;
    const optimize = formData.get("optimize") === "true";
    const metadataRaw = formData.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    let metadata = {};
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw as string);
      } catch (error) {
        console.error("Invalid metadata JSON:", error);
      }
    }

    const mediaInfo = await cdnManager.uploadMedia({
      file,
      path,
      optimize,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: mediaInfo,
    });
  } catch (error) {
    console.error("CDN upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 },
    );
  }
}

// Get media info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const list = searchParams.get("list") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const width = searchParams.get("width");
    const height = searchParams.get("height");
    const format = searchParams.get("format") as any;

    if (list) {
      const basePath = path || "";
      const result = await cdnManager.listMedia(basePath, limit, offset);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 },
      );
    }

    const mediaInfo = await cdnManager.getMediaInfo(path);

    if (!mediaInfo) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Generate optimized URL if parameters provided
    if (width || height || format) {
      const optimizedUrl = cdnManager.getOptimizedUrl(mediaInfo.url, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        format,
      });

      return NextResponse.json({
        success: true,
        data: {
          ...mediaInfo,
          optimizedUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: mediaInfo,
    });
  } catch (error) {
    console.error("CDN get error:", error);
    return NextResponse.json({ error: "Failed to get media" }, { status: 500 });
  }
}

// Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 },
      );
    }

    const success = await cdnManager.deleteMedia(path);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete media" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("CDN delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}

// Generate responsive image set
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const widthsRaw = searchParams.get("widths");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 },
      );
    }

    const mediaInfo = await cdnManager.getMediaInfo(path);

    if (!mediaInfo) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const widths = widthsRaw
      ? widthsRaw.split(",").map((w) => parseInt(w.trim()))
      : [320, 768, 1024, 1920];

    const responsiveSet = cdnManager.generateResponsiveSet(
      mediaInfo.url,
      widths,
    );

    return NextResponse.json({
      success: true,
      data: {
        original: mediaInfo,
        responsiveSet,
      },
    });
  } catch (error) {
    console.error("CDN responsive set error:", error);
    return NextResponse.json(
      { error: "Failed to generate responsive set" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "localization", "locales");

// Helper function to read JSON file safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJsonFile(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return {};
  }
}

// Helper function to write JSON file safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// GET - Get all translations for a specific language
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang: langCode } = await params;
    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);

    const translations = await readJsonFile(filePath);

    return NextResponse.json({
      success: true,
      language: langCode,
      translations,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load translations" },
      { status: 500 }
    );
  }
}

// PUT - Update entire language file
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang: langCode } = await params;
    const translations = await request.json();

    if (typeof translations !== "object" || translations === null) {
      return NextResponse.json(
        { success: false, message: "Invalid translations data" },
        { status: 400 }
      );
    }

    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });

    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
    await writeJsonFile(filePath, translations);

    return NextResponse.json({
      success: true,
      message: `${langCode} translations updated successfully`,
      language: langCode,
      translations,
    });
  } catch (error) {
    const { lang: langCode } = await params;
    console.error(`Error updating ${langCode} translations:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update ${langCode} translations`,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete entire language file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang: langCode } = await params;

    // Don't allow deleting English (default language)
    if (langCode === "en") {
      return NextResponse.json(
        { success: false, message: "Cannot delete default language" },
        { status: 400 }
      );
    }

    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, that's okay
      console.log(`File ${filePath} not found, continuing...`);
    }

    return NextResponse.json({
      success: true,
      message: `${langCode} language file deleted successfully`,
    });
  } catch (error) {
    const { lang: langCode } = await params;
    console.error(`Error deleting ${langCode} language:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to delete ${langCode} language` },
      { status: 500 }
    );
  }
}

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

// Helper function to set nested value in object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNestedValue(obj: any, path: string, value: string) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

// Helper function to get nested value from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

// Helper function to delete nested value from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteNestedValue(obj: any, path: string): boolean {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      return false;
    }
    current = current[keys[i]];
  }

  const lastKey = keys[keys.length - 1];
  if (current && lastKey in current) {
    delete current[lastKey];
    return true;
  }

  return false;
}

// GET - Get specific translation key for a language
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; key: string }> }
) {
  const { lang, key } = await params;
  try {
    const { lang, key } = params;
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);

    const translations = await readJsonFile(filePath);
    const value = getNestedValue(translations, key);

    return NextResponse.json({
      success: true,
      language: lang,
      key,
      value: value || null,
      exists: value !== undefined,
    });
  } catch (error) {
    console.error(`Error fetching ${params.lang}.${params.key}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to load ${params.lang}.${params.key}`,
      },
      { status: 500 }
    );
  }
}

// PUT - Update specific translation key for a language
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; key: string }> }
) {
  const { lang, key } = await params;
  try {
    const { lang, key } = params;
    const { value } = await request.json();

    if (typeof value !== "string") {
      return NextResponse.json(
        { success: false, message: "Value must be a string" },
        { status: 400 }
      );
    }

    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });

    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    const translations = await readJsonFile(filePath);

    setNestedValue(translations, key, value);
    await writeJsonFile(filePath, translations);

    return NextResponse.json({
      success: true,
      message: `${lang}.${key} updated successfully`,
      language: lang,
      key,
      value,
    });
  } catch (error) {
    console.error(`Error updating ${params.lang}.${params.key}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update ${params.lang}.${params.key}`,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific translation key from a language
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; key: string }> }
) {
  const { lang, key } = await params;
  try {
    const { lang, key } = params;
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);

    const translations = await readJsonFile(filePath);
    const deleted = deleteNestedValue(translations, key);

    if (deleted) {
      await writeJsonFile(filePath, translations);
    }

    return NextResponse.json({
      success: true,
      message: deleted
        ? `${lang}.${key} deleted successfully`
        : `${lang}.${key} not found`,
      language: lang,
      key,
      deleted,
    });
  } catch (error) {
    console.error(`Error deleting ${params.lang}.${params.key}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to delete ${params.lang}.${params.key}`,
      },
      { status: 500 }
    );
  }
}

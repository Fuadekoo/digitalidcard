import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "public", "locales");

// Helper function to read JSON file safely
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
async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Helper function to set nested value in object
function setNestedValue(obj: any, path: string, value: string) {
  const keys = path.split('.');
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
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

// Helper function to delete nested value from object
function deleteNestedValue(obj: any, path: string): boolean {
  const keys = path.split('.');
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

// GET - Get all translation keys for a specific language
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const langCode = searchParams.get('lang') || 'en';
    
    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
    const translations = await readJsonFile(filePath);
    
    return NextResponse.json({
      success: true,
      language: langCode,
      translations
    });
    
  } catch (error) {
    console.error("Error fetching translation keys:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load translation keys" },
      { status: 500 }
    );
  }
}

// POST - Add new translation key
export async function POST(request: NextRequest) {
  try {
    const { key, translations } = await request.json();
    
    if (!key || !translations || typeof translations !== 'object') {
      return NextResponse.json(
        { success: false, message: "Invalid data provided" },
        { status: 400 }
      );
    }
    
    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });
    
    // Update each language file
    for (const [langCode, value] of Object.entries(translations)) {
      const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
      const data = await readJsonFile(filePath);
      
      setNestedValue(data, key, value as string);
      await writeJsonFile(filePath, data);
    }
    
    return NextResponse.json({
      success: true,
      message: "Translation key added successfully",
      key,
      translations
    });
    
  } catch (error) {
    console.error("Error adding translation key:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add translation key" },
      { status: 500 }
    );
  }
}

// PUT - Update translation key
export async function PUT(request: NextRequest) {
  try {
    const { key, translations } = await request.json();
    
    if (!key || !translations || typeof translations !== 'object') {
      return NextResponse.json(
        { success: false, message: "Invalid data provided" },
        { status: 400 }
      );
    }
    
    // Update each language file
    for (const [langCode, value] of Object.entries(translations)) {
      const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
      const data = await readJsonFile(filePath);
      
      setNestedValue(data, key, value as string);
      await writeJsonFile(filePath, data);
    }
    
    return NextResponse.json({
      success: true,
      message: "Translation key updated successfully",
      key,
      translations
    });
    
  } catch (error) {
    console.error("Error updating translation key:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update translation key" },
      { status: 500 }
    );
  }
}

// DELETE - Delete translation key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { success: false, message: "Translation key is required" },
        { status: 400 }
      );
    }
    
    // Get all language files
    const files = await fs.readdir(LOCALES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Delete key from all language files
    for (const file of jsonFiles) {
      const filePath = path.join(LOCALES_DIR, file);
      const data = await readJsonFile(filePath);
      
      if (deleteNestedValue(data, key)) {
        await writeJsonFile(filePath, data);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Translation key deleted successfully",
      key
    });
    
  } catch (error) {
    console.error("Error deleting translation key:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete translation key" },
      { status: 500 }
    );
  }
}

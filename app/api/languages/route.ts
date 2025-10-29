import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "localization", "locales");

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationKey {
  key: string;
  translations: Record<string, string>;
}

// Default available languages
const defaultLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "or", name: "Oromo", nativeName: "Afaan Oromoo" },
  { code: "sm", name: "Somali", nativeName: "Soomaali" },
];

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

// Helper function to flatten nested translations
function flattenTranslations(data: any, prefix = ""): TranslationKey[] {
  const result: TranslationKey[] = [];

  const flatten = (obj: any, path: string) => {
    Object.keys(obj).forEach((key) => {
      const newPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        flatten(value, newPath);
      } else {
        result.push({
          key: newPath,
          translations: { [prefix]: String(value || "") },
        });
      }
    });
  };

  flatten(data, "");
  return result;
}

// Helper function to merge translations from multiple languages
function mergeTranslations(
  translationsByLang: Record<string, TranslationKey[]>
): TranslationKey[] {
  const mergedMap = new Map<string, TranslationKey>();

  // Collect all translation keys
  Object.values(translationsByLang)
    .flat()
    .forEach((translation) => {
      const existing = mergedMap.get(translation.key);
      if (existing) {
        mergedMap.set(translation.key, {
          key: translation.key,
          translations: {
            ...existing.translations,
            ...translation.translations,
          },
        });
      } else {
        mergedMap.set(translation.key, translation);
      }
    });

  return Array.from(mergedMap.values());
}

// GET - Fetch all languages and translations
export async function GET() {
  try {
    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });

    // Read all language files
    const files = await fs.readdir(LOCALES_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const translationsByLang: Record<string, TranslationKey[]> = {};
    const availableLanguages: Language[] = [];

    // Process each language file
    for (const file of jsonFiles) {
      const langCode = file.replace(".json", "");
      const filePath = path.join(LOCALES_DIR, file);
      const data = await readJsonFile(filePath);

      // Always include language in available languages if it exists in defaultLanguages
      const langInfo = defaultLanguages.find((lang) => lang.code === langCode);
      if (langInfo) {
        availableLanguages.push(langInfo);
      }

      // Only process translations if there's actual content
      if (Object.keys(data).length > 0) {
        translationsByLang[langCode] = flattenTranslations(data, langCode);
      }
    }

    // Ensure all default languages are included, even if they don't have files yet
    for (const lang of defaultLanguages) {
      if (!availableLanguages.find((l) => l.code === lang.code)) {
        availableLanguages.push(lang);
      }
    }

    // Merge all translations
    const translations = mergeTranslations(translationsByLang);

    return NextResponse.json({
      success: true,
      availableLanguages,
      translations,
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load languages" },
      { status: 500 }
    );
  }
}

// PUT - Save languages and translations
export async function PUT(request: NextRequest) {
  try {
    const { availableLanguages, translations } = await request.json();

    if (!availableLanguages || !translations) {
      return NextResponse.json(
        { success: false, message: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });

    // Group translations by language
    const translationsByLang: Record<string, any> = {};

    // Initialize with empty objects for each language
    availableLanguages.forEach((lang: Language) => {
      translationsByLang[lang.code] = {};
    });

    // Populate translations for each language
    translations.forEach((translation: TranslationKey) => {
      Object.keys(translation.translations).forEach((langCode) => {
        if (translationsByLang[langCode]) {
          // Convert flat key to nested object
          const keys = translation.key.split(".");
          let current = translationsByLang[langCode];

          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = translation.translations[langCode];
        }
      });
    });

    // Write each language file
    for (const [langCode, data] of Object.entries(translationsByLang)) {
      const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
      await writeJsonFile(filePath, data);
    }

    return NextResponse.json({
      success: true,
      message: "Languages saved successfully",
    });
  } catch (error) {
    console.error("Error saving languages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save languages" },
      { status: 500 }
    );
  }
}

// POST - Add new language
export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();

    if (!language || !language.code || !language.name || !language.nativeName) {
      return NextResponse.json(
        { success: false, message: "Invalid language data" },
        { status: 400 }
      );
    }

    // Ensure locales directory exists
    await fs.mkdir(LOCALES_DIR, { recursive: true });

    // Create empty translation file for new language
    const filePath = path.join(LOCALES_DIR, `${language.code}.json`);
    await writeJsonFile(filePath, {});

    return NextResponse.json({
      success: true,
      message: "Language added successfully",
      language,
    });
  } catch (error) {
    console.error("Error adding language:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add language" },
      { status: 500 }
    );
  }
}

// DELETE - Remove language
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const langCode = searchParams.get("code");

    if (!langCode) {
      return NextResponse.json(
        { success: false, message: "Language code is required" },
        { status: 400 }
      );
    }

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
      message: "Language removed successfully",
    });
  } catch (error) {
    console.error("Error removing language:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove language" },
      { status: 500 }
    );
  }
}

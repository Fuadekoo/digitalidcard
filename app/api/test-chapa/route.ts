import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const chapaApi = process.env.CHAPA_API;
    const chapaToken = process.env.CHAPA_TOKEN;
    const chapaEncryptionKey = process.env.CHAPA_ENCRYPTION_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const envCheck = {
      CHAPA_API: chapaApi ? "✅ Set" : "❌ Missing",
      CHAPA_TOKEN: chapaToken ? "✅ Set" : "❌ Missing",
      CHAPA_ENCRYPTION_KEY: chapaEncryptionKey ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_APP_URL: appUrl ? "✅ Set" : "❌ Missing",
    };

    // Test Chapa API connection
    let apiTest = "❌ Not tested";
    if (chapaApi && chapaToken) {
      try {
        const response = await fetch(`${chapaApi}/banks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chapaToken}`,
          },
        });

        if (response.ok) {
          apiTest = "✅ API connection successful";
        } else {
          apiTest = `❌ API error: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        apiTest = `❌ Connection error: ${error}`;
      }
    }

    return NextResponse.json({
      environment: envCheck,
      apiTest,
      instructions: {
        setup: "Add these to your .env.local file:",
        variables: [
          'CHAPA_API="https://api.chapa.co/v1"',
          'CHAPA_TOKEN="CHASECK_TEST-tlwSXblBmeL9Da8degDKrKRELPL7G3cr"',
          'CHAPA_ENCRYPTION_KEY="0j0zpUghilZZW4E0mP3xVlBx"',
          'NEXT_PUBLIC_APP_URL="http://localhost:3000"',
        ],
        note: "Get your CHAPA_TOKEN from https://chapa.co dashboard",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Test failed", details: error },
      { status: 500 }
    );
  }
}

# SuperAdmin Translation Guide - Step by Step

## Overview

This guide will help you translate ALL superAdmin pages one by one.

## Step 1: Home Page ✅ (Ready to translate)

**File:** `features/home/components/home-ui.tsx`

### Text to Translate:

1. "ID Card Generate System" → Add `t("home.systemTitle")`
2. "Why Choose Our System?" → Add `t("home.whyChoose")`
3. "System Uptime", "Support Available", "Data Security" → Add stats section
4. "Digital ID Card Management System" → Add main description
5. All feature cards (Secure & Reliable, User-Friendly, etc.)
6. "Our Mission" section

### Example:

```typescript
// Add import
import useTranslation from "@/hooks/useTranslation";

// In component
const { t } = useTranslation();

// Replace hardcoded text
<h1>{t("home.systemTitle")}</h1>
<p>{t("home.systemDescription")}</p>
```

## Step 2: Dashboard Page

**File:** `app/[lang]/dashboard/@superAdmin/dashboard/page.tsx`

### Components to check:

- `SummaryCards.tsx` - Statistics cards
- `RecentActivities.tsx` - Recent activity table
- `PaymentMethodsChart.tsx` - Payment charts
- Other dashboard components

## Step 3: Station Management Pages

**Files:**

- `station/page.tsx` - Station listing
- `station/new/page.tsx` - Create station
- `station/[stationId]/page.tsx` - View station
- `station/[stationId]/edit/page.tsx` - Edit station
- `station/[stationId]/stationUser/page.tsx` - Station users
- `station/[stationId]/report/page.tsx` - Station reports

## Step 4: User Management Pages

**Files:**

- `user/page.tsx` - User listing
- `user/new/page.tsx` - Create user
- `user/[userId]/page.tsx` - View user
- `user/[userId]/edit/page.tsx` - Edit user

## Step 5: Report Pages

**Files:**

- `reportData/page.tsx` - Main reports page
- `reportData/report-ui.tsx` - Report UI component

## Step 6: Languages Page

**File:** `languages/page.tsx` - Translation management

## Step 7: Profile Page

**File:** `profile/page.tsx` - User profile settings

---

## How to Add Translations for Each Page

### Step A: Add Translation Keys to JSON Files

1. **Identify the hardcoded text** in the component
2. **Create a key** for it (e.g., `home.systemTitle`)
3. **Add to all 3 language files** (en.json, am.json, or.json)

### Example - Adding Home Page Translations:

#### English (en.json):

```json
{
  "home": {
    "systemTitle": "ID Card Generate System",
    "systemDescription": "Digital ID Card Management System",
    "whyChoose": "Why Choose Our System?",
    "systemUptime": "System Uptime",
    "supportAvailable": "24/7 Support Available",
    "dataSecurity": "Data Security",
    "uptimeDescription": "Reliable and always available for your needs",
    "supportDescription": "Round-the-clock assistance whenever you need it",
    "securityDescription": "Your information is protected with advanced encryption",
    "secureReliable": "Secure & Reliable",
    "secureDescription": "Advanced security measures to protect citizen data",
    "userFriendly": "User-Friendly",
    "userFriendlyDescription": "Intuitive interface designed for easy navigation",
    "comprehensiveReports": "Comprehensive Reports",
    "reportsDescription": "Generate detailed reports and analytics",
    "qualityAssurance": "Quality Assurance",
    "qualityDescription": "Multi-level verification process ensures accuracy",
    "realTimeTracking": "Real-time Tracking",
    "trackingDescription": "Monitor ID card applications and processing status",
    "roleBasedAccess": "Role-Based Access",
    "accessDescription": "Granular permission system ensures users only access features",
    "ourMission": "Our Mission",
    "missionDescription": "Our Digital ID Card Management System is built with modern technology"
  }
}
```

#### Amharic (am.json):

```json
{
  "home": {
    "systemTitle": "የመታወቂያ ካርድ ማመንጨት ስርዓት",
    "systemDescription": "የዲጅታል መታወቂያ ካርድ አስተዳደር ስርዓት",
    "whyChoose": "ለምን ስርዓታችንን ይመርጣሉ?",
    "systemUptime": "የስርዓት ማቋረጥ",
    "supportAvailable": "24/7 ድጋፍ ይገኛል",
    "dataSecurity": "የውሂብ ደህንነት",
    "uptimeDescription": "አስተማማኝ እና ሁልጊዜ ይገኛል",
    "supportDescription": "ሀላፊነት ያለው እርዳታ",
    "securityDescription": "የእርስዎ መረጃ በላቀ ምስጢር ይቀበልናል",
    "secureReliable": "አስተማማኝ & ደህንነቱ የተጠበቀ",
    "secureDescription": "የእንዝርዝር ደህንነት ስራዎች",
    "userFriendly": "የተጠቃሚ በቀላሉ ሊገኝ",
    "userFriendlyDescription": "አመራር ቀላል ነው",
    "comprehensiveReports": "የሙሉ ሪፖርቶች",
    "reportsDescription": "ዝርዝር ሪፖርቶች እና ትንታኔዎችን ይፈጥሩ",
    "qualityAssurance": "የጥራት ዋስትና",
    "qualityDescription": "በብዙ ደረጃ ማረጋገጥ",
    "realTimeTracking": "በቀጥታ መከታተል",
    "trackingDescription": "የመታወቂያ ካርድ ማመልከቻዎችን ይከታተሉ",
    "roleBasedAccess": "በሚና ላይ የተመሰረተ መዳረሻ",
    "accessDescription": "የተመዘገቡ ፍቃዶች",
    "ourMission": "የእኛ ተልእኮ",
    "missionDescription": "የዲጅታል መታወቂያ ካርድ አስተዳደር ስርዓትን"
  }
}
```

#### Oromo (or.json):

```json
{
  "home": {
    "systemTitle": "Kaardii ID uumuun",
    "systemDescription": "Sagantaan bulchiinsa kaardii ID dijitaalaa",
    "whyChoose": "Maaliif sagantaa keenya filannee?",
    "systemUptime": "Hojiin sagantaa",
    "supportAvailable": "deeggarsa 24/7 argama",
    "dataSecurity": "nagaan odeeffannoo",
    "uptimeDescription": "ammamaa qabatee fi yeroo hundaa ni argama",
    "supportDescription": "tumsa yeroo hundaa qaba",
    "securityDescription": "odeeffannoon keessan tikseenyaan lakkaa'amuun",
    "secureReliable": "Haqaa & ammamaa qaba",
    "secureDescription": "hojiiwwan haqaawaa",
    "userFriendly": "fayyaddee irra jireessi",
    "userFriendlyDescription": "gadhiifannoo irra jireessi",
    "comprehensiveReports": "raagabaa guutuu",
    "reportsDescription": "raagabaa fi haalawaa xiinxaluu uumuu",
    "qualityAssurance": "gabaabsa tajaajila",
    "qualityDescription": "haala baay'inaan mirkaneessuu",
    "realTimeTracking": "hordofsi dhugaa hojii jira",
    "trackingDescription": "arjoomaan kaardii ID hordofsi",
    "roleBasedAccess": "saala irratti hundaa'ee kaa'uu",
    "accessDescription": "haqawaan miramnahan",
    "ourMission": "maksaa keenya",
    "missionDescription": "sagantaan bulchiinsa kaardii ID dijitaalaa"
  }
}
```

### Step B: Use Translation in Component

```typescript
// Before
<h1>ID Card Generate System</h1>;

// After
import useTranslation from "@/hooks/useTranslation";

const { t } = useTranslation();
<h1>{t("home.systemTitle")}</h1>;
```

---

## Next Steps

1. ✅ Start with Home Page - Add all translation keys
2. ⏳ Then Dashboard Page
3. ⏳ Then Station Management
4. ⏳ Then User Management
5. ⏳ Then Reports
6. ⏳ Then Languages
7. ⏳ Then Profile

## Quick Reference

- Always add translations to ALL 3 files: `en.json`, `am.json`, `or.json`
- Use the pattern: `{t("category.key")}`
- If translation is missing, the key itself will show (copy it and add to JSON files)
- Test in all 3 languages after adding translations

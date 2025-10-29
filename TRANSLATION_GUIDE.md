# Translation System Guide

## How to Use Translations in Your Components

### 1. Import the Translation Hook

```typescript
import useTranslation from "@/hooks/useTranslation";
```

### 2. Use the `t()` Function

```typescript
export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("dashboard.welcome")}</h1>
      <button>{t("common.save")}</button>
      <p>{t("messages.success")}</p>
    </div>
  );
}
```

### 3. Translation Key Structure

Translation keys follow this pattern:

- `common.*` - Common UI elements (buttons, labels)
- `auth.*` - Authentication related text
- `dashboard.*` - Dashboard specific text
- `navigation.*` - Navigation menu items
- `citizen.*` - Citizen management
- `user.*` - User management
- `station.*` - Station management
- `order.*` - Order management
- `profile.*` - Profile management
- `messages.*` - Success/error messages
- `validation.*` - Form validation messages

### 4. Adding New Translations

When you want to add a new translation:

1. First, use the key in your component (it will show as the key if translation doesn't exist):

```typescript
<h1>{t("myNewComponent.title")}</h1>
```

2. Copy the key and add it to all three language files:

   - `localization/locales/en.json`
   - `localization/locales/am.json`
   - `localization/locales/or.json`

3. Add the translation in each file:

```json
{
  "myNewComponent": {
    "title": "My Title" // English
  }
}
```

```json
{
  "myNewComponent": {
    "title": "የእኔ ርዕስ" // Amharic
  }
}
```

```json
{
  "myNewComponent": {
    "title": "maqaa naa" // Oromo
  }
}
```

### 5. Finding Missing Translations

If a translation is missing, the key itself will be displayed. Copy the key and add the translation to all three language files.

### 6. Examples from Your System

#### Login Form

```typescript
// Before
<label>{lang == "am" ? "መለያ ስም" : "Username"}</label>

// After
<label>{t("auth.username")}</label>
```

#### Buttons

```typescript
// Before
<button>{lang == "am" ? "አስቀምጥ" : "Save"}</button>

// After
<button>{t("common.save")}</button>
```

#### Success Messages

```typescript
// Before
toast.success("Citizen created successfully!");

// After
toast.success(t("citizen.createSuccess"));
```

### 7. Benefits

✅ **Consistency** - All text in one place  
✅ **Easy Translation** - Add new languages by copying translation files  
✅ **Fallback** - Shows English if translation missing  
✅ **Type Safety** - Get autocomplete suggestions  
✅ **Maintainability** - Update text in one place affects entire app

## Quick Start Checklist

- [ ] Import `useTranslation` hook
- [ ] Use `const { t } = useTranslation()` in component
- [ ] Replace hardcoded text with `t("key.name")`
- [ ] Add missing translations to all three language files
- [ ] Test in all three languages (am, en, or)

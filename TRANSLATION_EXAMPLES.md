# Translation Examples - How to Replace Hardcoded Text

## Quick Reference

When you see hardcoded text in your components, replace it with translation keys using this pattern:

### Pattern:

```typescript
// BEFORE (Hardcoded)
<label>{lang == "am" ? "ስም" : "Name"}</label>

// AFTER (Using Translation)
<label>{t("common.name")}</label>
```

## Common Replacements

### 1. Buttons

```typescript
// Save button
<Button>{t("common.save")}</Button>

// Cancel button
<Button>{t("common.cancel")}</Button>

// Submit button
<Button>{t("common.submit")}</Button>

// Edit button
<Button>{t("common.edit")}</Button>

// Delete button
<Button>{t("common.delete")}</Button>

// Close button
<Button>{t("common.close")}</Button>

// Back button
<Button>{t("common.back")}</Button>

// Next button
<Button>{t("common.next")}</Button>
```

### 2. Form Labels

```typescript
// Citizen form
<Label>{t("citizen.firstName")}</Label>
<Label>{t("citizen.middleName")}</Label>
<Label>{t("citizen.lastName")}</Label>
<Label>{t("citizen.registralNo")}</Label>
<Label>{t("citizen.gender")}</Label>
<Label>{t("citizen.phone")}</Label>
<Label>{t("citizen.occupation")}</Label>
<Label>{t("citizen.dateOfBirth")}</Label>

// User form
<Label>{t("user.username")}</Label>
<Label>{t("user.role")}</Label>
<Label>{t("user.status")}</Label>
<Label>{t("user.password")}</Label>

// Profile form
<Label>{t("profile.currentPassword")}</Label>
<Label>{t("profile.newPassword")}</Label>
<Label>{t("profile.confirmPassword")}</Label>
```

### 3. Messages

```typescript
// Success messages
toast.success(t("citizen.createSuccess"));
toast.success(t("user.updateSuccess"));
toast.success(t("profile.updateSuccess"));

// Error messages
toast.error(t("citizen.createFailed"));
toast.error(t("user.updateFailed"));
toast.error(t("profile.changePasswordFailed"));

// Validation messages
toast.error(t("validation.required"));
toast.error(t("validation.passwordTooShort"));
toast.error(t("validation.passwordsDontMatch"));
```

### 4. Titles and Headers

```typescript
// Page titles
<CardTitle>{t("citizen.title")}</CardTitle>
<CardTitle>{t("user.title")}</CardTitle>
<CardTitle>{t("profile.title")}</CardTitle>

// Section titles
<h2>{t("dashboard.overview")}</h2>
<h2>{t("report.title")}</h2>
```

### 5. Placeholders

```typescript
// Input placeholders
<Input placeholder={t("citizen.firstName")} />
<Input placeholder={t("auth.username")} />
<Input placeholder={t("auth.password")} />
```

### 6. Select Options

```typescript
// Gender options
<SelectItem value="MALE">{t("citizen.male")}</SelectItem>
<SelectItem value="FEMALE">{t("citizen.female")}</SelectItem>
<SelectItem value="OTHER">{t("citizen.other")}</SelectItem>

// Status options
<SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
<SelectItem value="INACTIVE">{t("status.inactive")}</SelectItem>
<SelectItem value="PENDING">{t("status.pending")}</SelectItem>
```

## Step-by-Step Process

### Step 1: Import the hook

```typescript
import useTranslation from "@/hooks/useTranslation";
```

### Step 2: Use it in your component

```typescript
export default function MyComponent() {
  const { t } = useTranslation();

  // ... rest of your component
}
```

### Step 3: Replace hardcoded text

Look for patterns like:

- `lang == "am" ? "..." : "..."`
- Hardcoded strings like `"Save"`, `"Cancel"`, etc.
- Toast messages like `toast.success("...")`

Replace with `t("category.key")`

### Step 4: Add missing translations

If you see the key displayed (like "citizen.myNewKey"), add it to all three language files:

#### English (en.json)

```json
{
  "citizen": {
    "myNewKey": "New Translation"
  }
}
```

#### Amharic (am.json)

```json
{
  "citizen": {
    "myNewKey": "አዲስ ትርጉም"
  }
}
```

#### Oromo (or.json)

```json
{
  "citizen": {
    "myNewKey": "galmee galchisuu haaraa"
  }
}
```

## Complete Example

### Before:

```typescript
export default function CitizenForm({ lang }: { lang: string }) {
  return (
    <form>
      <div>
        <label>{lang == "am" ? "የመጀመሪያ ስም" : "First Name"}</label>
        <input
          placeholder={lang == "am" ? "የመጀመሪያ ስም ያስገቡ" : "Enter first name"}
        />
      </div>
      <button onClick={() => toast.success(lang == "am" ? "ተሳክቷል" : "Success")}>
        {lang == "am" ? "አስቀምጥ" : "Save"}
      </button>
    </form>
  );
}
```

### After:

```typescript
import useTranslation from "@/hooks/useTranslation";

export default function CitizenForm({ lang }: { lang: string }) {
  const { t } = useTranslation();

  return (
    <form>
      <div>
        <label>{t("citizen.firstName")}</label>
        <input placeholder={t("citizen.firstName")} />
      </div>
      <button onClick={() => toast.success(t("messages.success"))}>
        {t("common.save")}
      </button>
    </form>
  );
}
```

## Available Translation Categories

Check `localization/locales/en.json` for all available keys:

- **common** - Buttons, labels, actions
- **auth** - Login, password, authentication
- **dashboard** - Dashboard specific text
- **navigation** - Menu items
- **roles** - User roles
- **citizen** - Citizen management
- **user** - User management
- **station** - Station management
- **order** - Order management
- **card** - ID card generation
- **profile** - Profile settings
- **report** - Reports
- **messages** - Success/error messages
- **validation** - Form validation
- **languages** - Translation management
- **form** - Form steps and labels
- **camera** - Camera capture
- **payment** - Payment methods
- **status** - Status values
- **stats** - Statistics labels
- **table** - Data table controls
- **notification** - Toast notifications

## Need Help?

1. Copy the key you see (like "citizen.myKey")
2. Add it to all three language files (en.json, am.json, or.json)
3. Add the translation for each language
4. Save the files
5. The translation will automatically appear

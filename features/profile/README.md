# Profile Feature

Feature-based profile viewing and editing for NextStep platform.

## Structure

```
features/profile/
├── components/
│   ├── ProfilePage.tsx          # Main orchestrator component
│   └── ProfileViewMode.tsx      # Read-only profile view
├── hooks/
│   ├── useProfileCompletion.ts  # Profile completion calculation
│   ├── useEducationManager.ts   # Education entries management
│   ├── useExperienceManager.ts  # Experience entries management
│   └── useProfileForm.ts        # Main form state management
├── helpers/
│   ├── validation.ts            # Validation functions
│   └── profile.ts               # Profile utility helpers
├── api.ts                       # Convex API hooks
├── constants.ts                 # Shared constants (skills, education levels)
├── types.ts                     # Type definitions
└── index.ts                     # Public API exports
```

## Components

### ProfilePage

Main orchestrator component that manages view/edit mode toggle.

**Features:**

- Authentication and user loading
- Mode switching (view/edit)
- Save/cancel handlers

### ProfileViewMode

Read-only display of user profile with completion tracking.

**Features:**

- Profile header with avatar
- Skills & interests display
- Goals display
- Progress indicator
- Edit button

### ProfileEditMode

Form interface for editing all profile fields.

**Features:**

- Tabbed sections (Basic Info, Education, Experience, Skills, Goals, Links)
- Inline validation errors
- Education entry management (add/edit/remove)
- Experience entry management (add/edit/remove)
- Save/cancel actions
- Unsaved changes indicator

## Hooks

### useProfileCompletion

Calculates profile completion percentage based on filled fields (including education and experience).

**Usage:**

```tsx
const completion = useProfileCompletion(user, formData, isEditing);
// Returns: { percentage: number, incomplete: string[] }
```

### useEducationManager

Manages education entries with add, update, remove, reorder, and validation.

**Usage:**

```tsx
const {
    entries,
    errors,
    addEntry,
    updateEntry,
    removeEntry,
    reorderEntries,
    validateEntry,
    validateAll,
    clearErrors,
} = useEducationManager({ initialEntries, onChange });
```

### useExperienceManager

Manages work experience entries with add, update, remove, reorder, and validation.

**Usage:**

```tsx
const {
    entries,
    errors,
    addEntry,
    updateEntry,
    removeEntry,
    reorderEntries,
    validateEntry,
    validateAll,
    clearErrors,
} = useExperienceManager({ initialEntries, onChange });
```

### useProfileForm

Main form state management hook combining all profile sections.

**Usage:**

```tsx
const {
    formData,
    isDirty,
    isSubmitting,
    setName,
    setBio,
    setSkills,
    // ... other setters
    educationManager,
    experienceManager,
    errors,
    validate,
    submit,
    reset,
} = useProfileForm({ user, onSubmit });
```

### useDebounce

Generic debounce hook that delays value updates until after a specified delay period.

**Usage:**

```tsx
const debouncedValue = useDebounce(value, 2000); // 2 second delay

// Use in effect to trigger actions after user stops typing
useEffect(() => {
    // This will only run 2 seconds after value stops changing
    performAction(debouncedValue);
}, [debouncedValue]);
```

## API Layer

### useProfile()

Get current user profile data.

### useUpdateProfile()

Mutation to update profile fields.

### useUpsertProfile()

Mutation to create/update user (used for initial setup).

## Shared Components

### SkillsSelector

Reusable multi-select component for skills, interests, or tags.

**Location:** `shared/components/ui/SkillsSelector.tsx`

**Props:**

- `label`: Display label
- `value`: Current selected items
- `onChange`: Callback when items change
- `suggestions`: Optional suggestion list
- `placeholder`: Input placeholder
- `disabled`: Disable editing
- `error`: Error message

## Helpers

### Validation (`helpers/validation.ts`)

- `validateUrl(url: string)` - Validate URL format
- `validateRequired(value, fieldName)` - Required field validation
- `validateMaxLength(value, max, fieldName)` - Max length validation
- `validateMinLength(value, min, fieldName)` - Min length validation
- `validateDateRange(start, end)` - Date range validation
- `validateEducationEntry(entry)` - Complete education entry validation
- `validateExperienceEntry(entry)` - Complete experience entry validation
- `validateSocialLinks(linkedin, github, portfolio)` - Social links validation
- `validateBasicProfile(data)` - Basic profile fields validation

### Profile Utilities (`helpers/profile.ts`)

- `detectIncompleteSections(user)` - Identify incomplete profile sections
- `getProfileStrengthMessage(percentage)` - Get motivational message
- `sortEducationByDate(entries)` - Sort education entries (most recent first)
- `sortExperienceByDate(entries)` - Sort experience entries (most recent first)
- `formatDateRange(start, end, isCurrent)` - Format date range for display
- `hasMinimumProfile(user)` - Check if profile meets minimum requirements
- `getNextRecommendedAction(user)` - Get next action to improve profile

## Types

### Core Types

- `User` - User profile data
- `ProfileFormData` - Form data structure
- `EducationEntry` - Education history entry
- `ExperienceEntry` - Work experience entry
- `DocumentEntry` - Document/attachment entry

### Validation & State

- `ProfileCompletion` - Completion percentage and incomplete fields
- `ProfileValidationError` - Validation error structure
- `IncompleteSection` - Incomplete section info with priority
- `ProfileField` - Field configuration for completion calculation

## Phase 1 Status ✅

- ✅ Feature directory structure created
- ✅ Profile types defined
- ✅ API layer implemented
- ✅ Profile completion hook created
- ✅ SkillsSelector extracted as reusable component
- ✅ ProfileViewMode component created
- ✅ ProfilePage orchestrator created
- ✅ Page route updated to use new structure

## Phase 2 Status ✅

- ✅ Extended types (EducationEntry, ExperienceEntry, DocumentEntry)
- ✅ Validation helpers created (URLs, dates, required fields)
- ✅ useEducationManager hook (add/edit/remove/validate)
- ✅ useExperienceManager hook (add/edit/remove/validate)
- ✅ useProfileForm hook (comprehensive state management)
- ✅ Profile completion updated to include education/experience
- ✅ Profile utility helpers (sort, format, detect incomplete)
- ✅ Form state management with dirty tracking
- ✅ Validation errors handling

## Phase 3 Status ✅

- ✅ ProfileEditMode component created (790 lines with dialogs)
- ✅ Six tabbed sections (Basic, Education, Experience, Skills, Goals, Links)
- ✅ EducationEntryCard sub-component with full CRUD
- ✅ ExperienceEntryCard sub-component with full CRUD
- ✅ Inline validation error display
- ✅ Timestamp to date string conversion for date inputs
- ✅ Edit/Cancel mode toggle in ProfilePage
- ✅ Unsaved changes indicator
- ✅ Proper form integration with useProfileForm hook

## Phase 4 Status ✅

- ✅ Connected Save button to Convex updateUserProfile mutation
- ✅ Cancel confirmation dialog when unsaved changes exist
- ✅ Navigation guard (beforeunload) for unsaved changes
- ✅ Success toast notification after save
- ✅ Error handling with retry dialog
- ✅ Proper data transformation for Convex
- ✅ Loading states during save operation

## Phase 5 Status ✅

- ✅ Implemented debounced auto-save with 2-second delay
- ✅ Created useDebounce custom hook
- ✅ Auto-save triggers after form changes (with debounce)
- ✅ Prevents auto-save on initial mount
- ✅ Subtle "Auto-saving..." indicator in header
- ✅ "Auto-saved at [time]" confirmation message
- ✅ No UI blocking during auto-save
- ✅ Validation check before auto-save
- ✅ Manual save flag prevents auto-save conflicts
- ✅ Silent failure for auto-save (doesn't show error dialogs)

## Next Phases

### Phase 6: Polish & Responsive Design

- [ ] Mobile responsive
- [ ] Loading states
- [ ] Animations

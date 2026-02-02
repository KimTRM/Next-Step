# Profile Feature

Feature-based profile viewing and editing for NextStep platform.

## Structure

```
features/profile/
├── components/
│   ├── ProfilePage.tsx          # Main orchestrator component
│   └── ProfileViewMode.tsx      # Read-only profile view
├── hooks/
│   └── useProfileCompletion.ts  # Profile completion calculation
├── api.ts                       # Convex API hooks
├── constants.ts                 # Shared constants (skills, education levels)
├── types.ts                     # Type definitions
└── index.ts                     # Public API exports
```

## Components

### ProfilePage

Main component that handles:

- Loading states
- User authentication checks
- View/edit mode orchestration
- User creation (if needed)

### ProfileViewMode

Read-only profile display with:

- Profile completion indicator
- Personal details
- Skills and interests
- Career goals
- Experience (hardcoded for now)
- Social links
- Documents

## Hooks

### useProfileCompletion

Calculates profile completion percentage based on filled fields.

**Usage:**

```tsx
const completion = useProfileCompletion(user, formData, isEditing);
// Returns: { percentage: number, incomplete: string[] }
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

## Phase 1 Status ✅

- ✅ Feature directory structure created
- ✅ Profile types defined
- ✅ API layer implemented
- ✅ Profile completion hook created
- ✅ SkillsSelector extracted as reusable component
- ✅ ProfileViewMode component created
- ✅ ProfilePage orchestrator created
- ✅ Page route updated to use new structure

## Next Phases

### Phase 2: Profile Feature Structure + State

- [ ] Education entry management
- [ ] Experience entry management
- [ ] Document upload handling

### Phase 3: Edit Mode Form

- [ ] ProfileEditMode component
- [ ] React Hook Form integration
- [ ] Validation rules
- [ ] Form sections

### Phase 4: Save, Cancel, Unsaved Changes

- [ ] Save/Cancel handlers
- [ ] Dirty state detection
- [ ] Navigation warnings

### Phase 5: Auto-save

- [ ] Debounced auto-save
- [ ] Save indicators
- [ ] Error handling

### Phase 6: Polish

- [ ] Mobile responsive
- [ ] Loading states
- [ ] Animations

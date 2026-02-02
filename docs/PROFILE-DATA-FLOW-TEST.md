# Profile Data Flow Testing Guide

## Overview

This guide will help you verify that profile data flows correctly from Edit Mode → Save → Database → View Mode.

## What Was Fixed

### 1. **Backend Support for Education & Experience** ✅

- Updated `convex/schema.ts` to include `experience` array field
- Updated `convex/users/mutations.ts` `updateUserProfile` mutation to accept education and experience arrays
- Added support for saving complete education and work history

### 2. **Frontend Data Saving** ✅

- Updated `ProfileEditMode.tsx` to send education and experience arrays when saving
- Removed the TODO warning about unsupported fields

### 3. **View Components Use Real Data** ✅

- All hardcoded mock data has been removed
- `ExperienceList` displays `user.experience[]`
- `EducationList` displays `user.education[]`
- Empty states show when no data exists

## Testing Steps

### Step 1: View Your Current Profile

1. Navigate to `/profile` in your browser
2. Observe what data is currently displayed
3. Note any empty sections (education, experience, etc.)

**Expected Result:**

- Should see your name, email, and any existing data
- Empty sections should show: "No experience added yet. Click Edit Profile to add..."
- Profile completion percentage should be visible in the sidebar

---

### Step 2: Enter Edit Mode

1. Click the "Edit Profile" button (pencil icon next to your name)
2. You should see the tabbed edit interface with 6 sections:
    - Basic Info
    - Education
    - Experience
    - Skills & Interests
    - Goals
    - Social Links

**Expected Result:**

- Edit mode loads with your current data pre-filled
- Profile completion indicator shows in header (e.g., "85%")
- All tabs are clickable

---

### Step 3: Add Education Entry

1. Click the "Education" tab
2. Click "Add Education" button
3. Fill in the form:
    - **Degree**: "Bachelor of Science in Computer Science"
    - **Institution**: "Your University"
    - **Start Date**: Select a date (e.g., September 2020)
    - **End Date**: Select a date or check "Currently studying"
    - **Description** (optional): "Focused on software engineering and algorithms"
4. Observe auto-save indicator (should show "Auto-saved" after 2 seconds)

**Expected Result:**

- Education card appears immediately
- Auto-save notification appears after 2 seconds
- No errors in console

---

### Step 4: Add Work Experience Entry

1. Click the "Experience" tab
2. Click "Add Experience" button
3. Fill in the form:
    - **Job Title**: "Software Engineer Intern"
    - **Company**: "Tech Company Inc"
    - **Location**: "San Francisco, CA"
    - **Start Date**: Select a date (e.g., June 2023)
    - **End Date**: Select a date or check "Currently working"
    - **Description** (optional): "Developed features using React and Node.js"
4. Observe auto-save indicator

**Expected Result:**

- Experience card appears immediately
- Auto-save notification appears after 2 seconds
- No errors in console

---

### Step 5: Update Skills and Other Fields

1. Click "Skills & Interests" tab
2. Add some skills (e.g., JavaScript, React, Python)
3. Add some interests (e.g., Web Development, Machine Learning)
4. Go to "Basic Info" tab and update your bio
5. Go to "Social Links" tab and add LinkedIn/GitHub URLs

**Expected Result:**

- All changes auto-save after 2 seconds
- Profile completion percentage increases as you add more data
- Green badge shows "85%" → "90%" → etc.

---

### Step 6: Manual Save and Exit

1. Make a final change (e.g., update your location)
2. Click the "Save Changes" button (top right)
3. Wait for success toast: "Profile updated successfully!"
4. You should automatically return to View Mode

**Expected Result:**

- Toast notification appears
- Redirects to View Mode
- All your changes are visible

---

### Step 7: Verify Data Persistence

1. In View Mode, verify all your changes are displayed:
    - ✅ Education section shows your university entry
    - ✅ Experience section shows your internship entry
    - ✅ Skills section shows your skill badges
    - ✅ Interests section shows your interest badges
    - ✅ Bio shows your updated text
    - ✅ Social links are clickable
2. Refresh the page (F5)
3. All data should still be there

**Expected Result:**

- All data persists after page refresh
- No mock data is visible
- Profile completion reflects your actual data

---

### Step 8: Test Empty States

1. Go back to Edit Mode
2. Remove all education entries (click X button)
3. Remove all experience entries (click X button)
4. Save and return to View Mode

**Expected Result:**

- Education section shows: "No education added yet. Click Edit Profile to add..."
- Experience section shows: "No experience added yet. Click Edit Profile to add..."
- Profile completion percentage decreases

---

## Common Issues & Solutions

### Issue: Education/Experience not saving

**Check:**

- Open browser DevTools → Console
- Look for errors when saving
- Check Network tab for failed requests to Convex

**Solution:**

- Convex schema and mutations have been updated
- Restart dev server: `npm run dev`
- Clear browser cache

### Issue: Data doesn't appear after save

**Check:**

- Did you see "Profile updated successfully!" toast?
- Check browser console for errors
- Look at Convex dashboard (if available)

**Solution:**

- Verify the `updateProfile` mutation is being called
- Check that arrays aren't empty: `education: []` won't save

### Issue: Old mock data still appears

**Check:**

- Which file are you viewing? Old `ProfilePageContent.tsx` or new `ProfilePage.tsx`?
- Check route: Should be using `/profile` route

**Solution:**

- Clear old hardcoded constants
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

---

## Data Flow Diagram

```
User Input in Edit Mode
         ↓
ProfileEditMode component
         ↓
useProfileForm hook (validates)
         ↓
updateProfile mutation call
         ↓
Convex updateUserProfile mutation
         ↓
Database (users collection)
         ↓
useProfile query refetch
         ↓
ProfileViewMode component
         ↓
Displays updated data
```

---

## Files Modified for This Test

1. **convex/schema.ts** - Added `experience` field to users table
2. **convex/users/mutations.ts** - Updated `updateUserProfile` to accept education/experience
3. **features/profile/components/ProfileEditMode.tsx** - Now sends education/experience arrays
4. **features/profile/components/ProfileViewMode.tsx** - Refactored to use modular components
5. **features/profile/components/view/** - New modular view components (7 files)
6. **features/profile/components/edit/** - Started edit section components (1 file)

---

## Next Steps After Testing

If all tests pass:

- ✅ Data flow is working correctly
- ✅ Continue refactoring EditMode into smaller components
- ✅ Add more features (avatars, documents, etc.)

If tests fail:

- 🔍 Check console errors
- 🔍 Verify Convex mutations are receiving data
- 🔍 Check schema matches frontend types
- 🔍 Restart dev server

---

## Success Criteria

✅ **PASS** - You can:

1. Add education entries and see them in View Mode
2. Add experience entries and see them in View Mode
3. Update skills, bio, social links
4. See real-time profile completion percentage
5. Data persists after page refresh
6. Empty states show helpful messages
7. Auto-save works (2-second debounce)
8. Manual save works
9. No console errors
10. No TypeScript errors

❌ **FAIL** - If any of the above don't work, review the Data Flow Diagram and check the relevant files.

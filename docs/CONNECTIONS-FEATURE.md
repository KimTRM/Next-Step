# Connections Feature - Database Migration Guide

This guide explains how to properly set up the Connections feature in your Convex database.

## Overview

The Connections feature adds a user-to-user connection system (similar to friends/network) to NextStep. It includes:

- **Connection Requests**: Users can send connection requests with optional messages
- **Request Management**: Accept, reject, or cancel pending requests
- **Connections List**: View all accepted connections

## Database Schema

The feature adds a new `connections` table to your Convex schema with the following structure:

```typescript
connections: defineTable({
    requesterId: v.id("users"),      // User who sent the request
    receiverId: v.id("users"),       // User who received the request
    status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
    ),
    message: v.optional(v.string()), // Optional connection message
    createdAt: v.number(),           // When request was sent
    respondedAt: v.optional(v.number()), // When accepted/rejected
})
    .index("by_requester", ["requesterId"])
    .index("by_receiver", ["receiverId"])
    .index("by_requester_receiver", ["requesterId", "receiverId"])
    .index("by_status", ["status"])
    .index("by_receiver_status", ["receiverId", "status"])
```

## Migration Steps

### Step 1: Deploy Schema Changes

Since Convex handles schema migrations automatically, you just need to deploy your updated schema:

```bash
npx convex dev
```

**IMPORTANT**: This step regenerates the TypeScript types in `convex/_generated/`. You'll see TypeScript errors until this completes.

Or for production:

```bash
npx convex deploy
```

Convex will automatically:
1. Detect the new `connections` table
2. Create the table and indexes
3. Regenerate TypeScript types in `convex/_generated/api.d.ts`
4. No data migration needed since it's a new table

### Step 2: Verify the Migration

After deployment, verify the schema was applied correctly:

1. Open your Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to the "Data" tab
4. You should see the new `connections` table listed
5. Click on it to verify it's empty and ready for use

### Step 3: Verify TypeScript Types

After running `npx convex dev`, check that the types regenerated:

1. Open `convex/_generated/api.d.ts` (or `api.js`)
2. Search for "connections" - you should see the new module
3. The TypeScript errors in your IDE should be gone

### Step 4: Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the following scenarios:
   - **Send Connection Request**: 
     - Go to Messages → Click new message icon (SquarePen) → Search for a user → Click "Connect"
     - Or go to Mentors → Click "Connect" on any mentor
   
   - **View Connections Modal**: 
     - Click the Users icon next to your profile picture in the header
     - Check all three tabs: Connections, Requests (inbound), Sent (outbound)
   
   - **Accept/Reject Requests**: 
     - In the Connections modal, go to "Requests" tab
     - Accept or decline pending requests
   
   - **Cancel Outbound Requests**: 
     - In the Connections modal, go to "Sent" tab
     - Cancel any pending requests you've sent

## API Reference

### Queries

| Function | Description |
|----------|-------------|
| `getConnections` | Get all accepted connections for current user |
| `getInboundRequests` | Get pending requests received by current user |
| `getOutboundRequests` | Get pending requests sent by current user |
| `getConnectionStatus` | Check connection status with specific user |
| `getPendingRequestCount` | Get count of pending inbound requests |

### Mutations

| Function | Description |
|----------|-------------|
| `sendConnectionRequest` | Send a connection request to another user |
| `acceptConnectionRequest` | Accept a pending connection request |
| `rejectConnectionRequest` | Reject a pending connection request |
| `cancelConnectionRequest` | Cancel a sent connection request |
| `removeConnection` | Remove an existing connection |

## Files Created/Modified

### New Files

- `convex/connections/queries.ts` - Query functions
- `convex/connections/mutations.ts` - Mutation functions
- `convex/connections/index.ts` - Barrel exports
- `features/connections/api.ts` - React hooks for Convex
- `features/connections/types.ts` - TypeScript types
- `features/connections/index.ts` - Feature exports
- `features/connections/components/ConnectionsModal.tsx` - Main modal
- `features/connections/components/ConnectionRequestModal.tsx` - Request modal
- `features/connections/components/index.ts` - Component exports

### Modified Files

- `convex/schema.ts` - Added connections table definition
- `shared/components/layout/Header.tsx` - Added connections icon and modal
- `features/mentors/components/ConnectModal.tsx` - Added connection creation
- `features/messages/components/UserSearchModal.tsx` - Added connect button functionality

## Troubleshooting

### "Table 'connections' does not exist"

Run `npx convex dev` to deploy the schema changes.

### "Index 'by_receiver_status' not found"

This usually means the schema wasn't fully deployed. Try:
```bash
npx convex dev --once
```

### Connection request fails silently

Check the browser console for errors. Common issues:
- User not authenticated
- Target user doesn't exist
- Connection already exists between users

### Pending count not updating

The `usePendingRequestCount` hook uses real-time subscriptions. If it's not updating:
1. Check that Convex is connected (no errors in console)
2. Verify the query is returning correct data in Convex Dashboard

## Best Practices

1. **Auto-Accept Logic**: When User A sends a request to User B who already sent one to A, the request is auto-accepted. This creates a seamless experience.

2. **Rejected Requests**: Rejected requests remain in the database but won't show up in pending lists. Users can't re-send requests to the same person.

3. **Real-time Updates**: All connection data uses Convex's real-time subscriptions, so changes appear immediately across all connected clients.

## Security Notes

- All mutations verify the user's authentication status
- Users can only accept/reject requests sent TO them
- Users can only cancel requests sent BY them
- Either party can remove an accepted connection

# Phase 2: Remaining Errors (186 lines, ~90 unique errors)

## ✅ Phase 1 Complete
- Removed module exclusions from tsconfig.json
- Decorators working correctly
- **86% of errors eliminated** (1356 → 186)

---

## 📊 Error Breakdown by File

| File | Errors | Primary Issues |
|------|--------|---------------|
| `messages.service.ts` | 35 | Message.sender, mediaUrls, ppvPrice, conversation |
| `analytics.service.ts` | 16 | LedgerEntry.type, Post.authorId, Subscription.currentPeriodEnd |
| `posts.service.ts` | 11 | Post.authorId, Post.content, Post.media, Post.moderationStatus |
| `security/ip-whitelist.service.ts` | 9 | iPWhitelist → ipWhitelist (typo) |
| `public.service.ts` | 9 | Post.authorId, Post.author |
| `payouts.service.ts` | 6 | PayoutStatus.COMPLETED, Payout.method |
| `crm.service.ts` | 6 | AuditLog missing 'id' field |
| `two-factor.service.ts` | 5 | AuditLog missing 'id' field |
| `payments.service.ts` | 5 | LedgerEntry.type |
| `boost.service.ts` | 5 | Boost.targetType, Boost.targetId, Boost.endAt |
| Others | 19 | Various field mismatches |

---

## 🎯 Fix Priority (by impact)

### 1. Message Model Issues (35 errors) - HIGHEST PRIORITY
**File**: `src/modules/messages/messages.service.ts`

**Issues**:
- ❌ `message.sender` → ✅ `message.senderId` + `include: { sender: true }`
- ❌ `message.mediaUrls` → ✅ `message.mediaUrl`
- ❌ `message.ppvPrice` → ✅ `message.priceCents`
- ❌ `conversation.messages` → ✅ Need to include messages
- ❌ `conversation.user1` → ✅ `conversation.user1Id` + `include: { user1: true }`
- ❌ `conversation.lastMessageAt` → ✅ `conversation.lastMsgAt`

**Fix Strategy**: Update all Prisma queries to use correct field names and add includes for relations.

---

### 2. Analytics LedgerEntry.type (16 errors) - HIGH PRIORITY
**File**: `src/modules/analytics/analytics.service.ts`

**Issue**: LedgerEntry model doesn't have a `type` field in Prisma schema

**Occurrences**:
- Line 40: `where: { type: 'SUBSCRIPTION' }`
- Line 49: `where: { type: 'TIP' }`
- Line 187: `where: { type: 'SUBSCRIPTION' }`
- Line 195: `where: { type: 'TIP' }`
- Line 203: `where: { type: 'PURCHASE' }`

**Fix Options**:
1. **Option A**: Add `type` field to LedgerEntry schema in Prisma
2. **Option B**: Use different filtering logic (check description field or related records)
3. **Option C**: Remove type filtering and use other identifiers

---

### 3. Post.authorId → creatorId (11 errors) - HIGH PRIORITY
**Files**: `posts.service.ts`, `analytics.service.ts`, `public.service.ts`

**Issue**: Code uses `authorId` but Prisma schema has `creatorId`

**Fixes needed**:
- Replace all `authorId` with `creatorId` in where clauses
- Replace all `author` includes with `creator` includes
- Update `Post.authorId` references to `Post.creatorId`

---

### 4. iPWhitelist Typo (9 errors) - MEDIUM PRIORITY
**File**: `src/modules/security/services/ip-whitelist.service.ts`

**Issue**: `prisma.iPWhitelist` should be `prisma.ipWhitelist` (lowercase 'p')

**Fix**: Simple find/replace `iPWhitelist` → `ipWhitelist`

---

### 5. AuditLog Missing 'id' Field (6 errors) - MEDIUM PRIORITY
**Files**: `crm.service.ts`, `two-factor.service.ts`, `security services`

**Issue**: AuditLog.create() requires an `id` field

**Example**:
```typescript
// ❌ Current (missing id)
await prisma.auditLog.create({
  data: {
    userId: user.id,
    event: 'EMAIL_ADDED',
    resource: 'FAN_EMAIL',
    meta: { email: dto.email }
  }
});

// ✅ Fix (add id)
await prisma.auditLog.create({
  data: {
    id: randomUUID(),
    userId: user.id,
    event: 'EMAIL_ADDED',
    resource: 'FAN_EMAIL',
    meta: { email: dto.email }
  }
});
```

---

### 6. Payout Issues (6 errors) - LOW PRIORITY
**File**: `src/modules/payouts/payouts.service.ts`

**Issues**:
- ❌ `PayoutStatus.COMPLETED` → ✅ `PayoutStatus.PAID`
- ❌ `payout.method` → Field doesn't exist in schema

---

### 7. Post Schema Issues (11 errors) - LOW PRIORITY
**Files**: `posts.service.ts`, `public.service.ts`

**Issues**:
- ❌ `post.content` → Field doesn't exist (use `caption`)
- ❌ `post.media` → Need to include media relation
- ❌ `post.moderationStatus` → Field doesn't exist

---

### 8. Other Field Mismatches (Remaining errors)

#### Boost Model (5 errors)
- `Boost.targetType` → Doesn't exist
- `Boost.targetId` → Doesn't exist
- `Boost.endAt` → Use `expiresAt`

#### Conversation Model (2 errors)
- `Conversation.lastMessageAt` → `lastMsgAt`

#### Purchase Model (2 errors)
- `Purchase.userId` → Use `user` relation
- `Purchase.accessGranted` → Doesn't exist

#### Subscription Model (3 errors)
- `Subscription.currentPeriodEnd` → Doesn't exist
- `Subscription.amount` → Doesn't exist

#### Storage/Media (3 errors)
- `Media.owner` → Use `ownerId` or include owner relation

#### Tickets (3 errors)
- `Ticket.ticketNumber` → Doesn't exist
- `Ticket.assignedToId` → Use `assignedTo` relation

---

## 🚀 Execution Plan

### Step 1: Fix Messages Module (35 errors)
1. Open `src/modules/messages/messages.service.ts`
2. Replace field names:
   - `sender` → `senderId` (add include)
   - `mediaUrls` → `mediaUrl`
   - `ppvPrice` → `priceCents`
   - `user1`/`user2` → add includes
   - `lastMessageAt` → `lastMsgAt`

### Step 2: Fix Analytics Module (16 errors)
1. Open `src/modules/analytics/analytics.service.ts`
2. Remove or replace `LedgerEntry.type` filters
3. Fix `Post.authorId` → `creatorId`
4. Fix `Subscription.currentPeriodEnd`

### Step 3: Fix Posts Module (11 errors)
1. Open `src/modules/posts/posts.service.ts`
2. Replace `authorId` → `creatorId`
3. Replace `content` → `caption`
4. Add `media` includes
5. Remove `moderationStatus` references

### Step 4: Fix Security Module (9 errors)
1. Open `src/modules/security/services/ip-whitelist.service.ts`
2. Find/replace: `iPWhitelist` → `ipWhitelist`

### Step 5: Fix Public Module (9 errors)
1. Open `src/modules/public/public.service.ts`
2. Replace `authorId` → `creatorId`
3. Replace `author` → `creator` in includes

### Step 6: Fix Payouts Module (6 errors)
1. Open `src/modules/payouts/payouts.service.ts`
2. Replace `PayoutStatus.COMPLETED` → `PayoutStatus.PAID`
3. Remove `payout.method` references

### Step 7: Fix CRM Module (6 errors)
1. Open `src/modules/crm/crm.service.ts`
2. Add `id: randomUUID()` to all AuditLog.create() calls

### Step 8: Fix Remaining Files
- `boost.service.ts` (5 errors)
- `two-factor.service.ts` (5 errors)
- `payments.service.ts` (5 errors)
- `storage/*.ts` (8 errors)
- Others (19 errors)

---

## ⏱️ Time Estimate

| Step | Time | Difficulty |
|------|------|------------|
| Messages | 10 min | Easy |
| Analytics | 8 min | Medium |
| Posts | 5 min | Easy |
| Security | 2 min | Easy |
| Public | 3 min | Easy |
| Payouts | 3 min | Easy |
| CRM | 3 min | Easy |
| Others | 15 min | Medium |
| **Total** | **~50 min** | **Medium** |

---

## ✅ Success Criteria

After Phase 2:
- ✅ 0 TypeScript compilation errors
- ✅ All modules compile successfully
- ✅ Ready to re-enable all modules in `app.module.ts`
- ✅ Ready to test admin panel functionality

---

## 🎯 Next Steps

1. **User Decision**: Start fixing files systematically?
2. **Approach**: Fix file by file, or all at once?
3. **Testing**: After each module or after all fixes?

# Cart Auto-Cleanup (TTL) System

## Overview

Automatic cart cleanup system using MongoDB TTL (Time To Live) indexes. Carts are automatically deleted after a period of inactivity to maintain database efficiency.

## Configuration

**TTL Settings** (`src/lib/constants/cart.ts`):
- **Guest Carts**: 7 days
- **Authenticated User Carts**: 30 days

## How It Works

### 1. Automatic Expiration
- Each cart has an `expiresAt` field
- MongoDB automatically deletes carts when `expiresAt` is reached
- No manual cleanup scripts needed

### 2. Expiration Extension
Cart expiration is automatically extended on any activity:
- Adding items to cart
- Updating item quantities
- Removing items
- Applying/removing promo codes

### 3. TTL Logic
```javascript
// Guest carts (no userId)
expiresAt = now + 7 days

// Authenticated user carts (has userId)
expiresAt = now + 30 days
```

## Database Schema

```javascript
{
  userId: String,           // User ID (if authenticated)
  sessionId: String,        // Session ID
  items: [...],            // Cart items
  expiresAt: Date,         // 🆕 Expiration date (required)
  // ... other fields
}
```

### TTL Index
```javascript
// Automatically created by Mongoose
{ expiresAt: 1 }, { expireAfterSeconds: 0 }
```

## Migration

For existing carts without `expiresAt`, run the migration script:

```bash
npm run cart:migrate-ttl
```

This will:
1. Find all carts without `expiresAt`
2. Calculate expiration based on cart type (guest/user)
3. Set `expiresAt` based on `updatedAt` or `createdAt`

## API Changes

All cart endpoints now:
1. Set `expiresAt` when creating new carts
2. Extend `expiresAt` on any cart modification

### Affected Endpoints
- `POST /api/cart/add` - Creates/updates cart with expiration
- `POST /api/cart/update` - Extends expiration
- `POST /api/cart/remove` - Extends expiration
- `POST /api/cart/clear` - Sets new expiration
- `POST /api/cart/promo/apply` - Extends expiration
- `POST /api/cart/promo/remove` - Extends expiration

## Business Logic

### Why Different TTLs?

**Guest Carts (7 days)**:
- Shorter lifecycle
- No user account = less commitment
- Prevents database bloat from abandoned carts

**User Carts (30 days)**:
- Better UX for returning customers
- Users expect saved carts
- Account-based = more likely to return

### Activity-Based Extension

Every cart interaction extends the expiration:
- User actively shopping → cart stays alive
- Abandoned cart → automatically deleted after TTL
- No need to worry about losing active carts

## Monitoring

### Check TTL Index
```javascript
// In MongoDB shell
db.carts.getIndexes()

// Should see:
{
  "key": { "expiresAt": 1 },
  "expireAfterSeconds": 0
}
```

### View Cart Expiration
```javascript
// Find carts expiring soon
db.carts.find({
  expiresAt: { 
    $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
  }
})
```

## Best Practices

1. **Never modify TTL constants without migration**
   - Existing carts need to be updated
   - Run migration after changes

2. **Monitor deletion rates**
   - Track cart deletions vs creations
   - Adjust TTLs if needed

3. **Test before deploy**
   - Verify TTL index creation
   - Test expiration extension logic

4. **Consider order creation**
   - Carts are typically deleted after order creation
   - TTL is a backup cleanup mechanism

## Troubleshooting

### TTL Not Working?

1. **Check index exists**:
   ```bash
   db.carts.getIndexes()
   ```

2. **Verify expiresAt field**:
   ```bash
   db.carts.findOne()
   ```

3. **MongoDB background task**:
   - TTL deletion runs every 60 seconds
   - Delay is normal

4. **Check MongoDB version**:
   - TTL requires MongoDB 2.2+

### Carts Expiring Too Fast?

- Check TTL constants in `src/lib/constants/cart.ts`
- Verify expiration extension logic
- Review cart activity patterns

## Future Improvements

- [ ] Admin dashboard for cart analytics
- [ ] Abandoned cart recovery emails
- [ ] Seasonal TTL adjustments (holidays = longer TTL)
- [ ] Custom TTL per user tier (premium users = longer TTL)

## References

- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
- [Cart Schema](../src/lib/db/models/Cart.ts)
- [Cart Constants](../src/lib/constants/cart.ts)

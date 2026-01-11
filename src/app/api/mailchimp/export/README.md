# Mailchimp Export API

## Endpoint
`POST /api/mailchimp/export`

## Purpose
Exports all marketing emails from MongoDB `MarketingEmails` collection to a Mailchimp audience list.

## Security
Requires `Authorization` header with Bearer token matching `API_SECRET_KEY` environment variable.

## Environment Variables
```env
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=your_audience_list_id
API_SECRET_KEY=your_secure_random_secret
```

## Usage Example

### cURL
```bash
curl -X POST https://your-domain.com/api/mailchimp/export \
  -H "Authorization: Bearer your_api_secret_key" \
  -H "Content-Type: application/json"
```

### Node.js/fetch
```javascript
const response = await fetch('https://your-domain.com/api/mailchimp/export', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();
console.log(result);
```

## Response Format

### Success (200)
```json
{
  "success": true,
  "totalEmails": 150,
  "successCount": 148,
  "errorCount": 2,
  "errors": [
    { "email": "invalid@", "error": "Invalid email format" },
    { "email": "test@test.com", "error": "Mailchimp batch error" }
  ],
  "message": "Successfully exported 148 out of 150 emails"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "totalEmails": 0,
  "successCount": 0,
  "errorCount": 0,
  "message": "Unauthorized"
}
```

### Error (500)
```json
{
  "success": false,
  "totalEmails": 0,
  "successCount": 0,
  "errorCount": 0,
  "message": "Failed to export emails to Mailchimp"
}
```

## Features
- ✅ Validates all emails before export
- ✅ Batch processing (500 emails per batch for Mailchimp limits)
- ✅ Upsert logic (creates or updates subscribers)
- ✅ Tracks export source as "promo_code"
- ✅ Preserves signup timestamp from MongoDB
- ✅ Error handling with detailed reporting
- ✅ Production-ready with proper TypeScript types
- ✅ Secure with API key authentication

## Setup Mailchimp

1. Get your API key from Mailchimp account settings
2. Find your server prefix (e.g., "us1", "us6") from API key or account URL
3. Create an audience list and copy the List ID
4. Set environment variables in `.env.local`

## Notes
- Mailchimp batch operations may take a few seconds to process
- Response includes first 100 errors to avoid payload bloat
- All emails are normalized to lowercase
- Invalid emails are skipped and reported in errors
- Subscribers are set to "subscribed" status automatically

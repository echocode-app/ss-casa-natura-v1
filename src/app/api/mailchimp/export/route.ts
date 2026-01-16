import { NextRequest, NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Configure Mailchimp client
function configureMailchimp() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !serverPrefix) {
    throw new Error('Mailchimp configuration missing');
  }

  mailchimp.setConfig({
    apiKey,
    server: serverPrefix,
  });
}

interface ExportResult {
  success: boolean;
  totalEmails: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{ email: string; error: string }>;
  message?: string;
}

/**
 * POST /api/mailchimp/export
 * Exports marketing emails from MongoDB to Mailchimp audience list
 *
 * Security: Requires Authorization header with API_SECRET_KEY
 *
 * Returns:
 * - 200: { success: true, totalEmails, successCount, errorCount }
 * - 401: Unauthorized
 * - 500: Server error
 */
export const POST = handleApi(async (req: NextRequest): Promise<NextResponse<ExportResult>> => {
  // 1. Authorization options:
  // - Admin session cookie (browser/admin panel)
  // - Bearer API_SECRET_KEY (server-to-server)
  const authHeader = req.headers.get('authorization');
  const apiSecret = process.env.API_SECRET_KEY;
  const hasValidSecret = !!apiSecret && authHeader === `Bearer ${apiSecret}`;

  if (!hasValidSecret) {
    const authError = await requireAdmin();
    if (authError) return authError as any;
  }

  try {
    // 2. Configure Mailchimp
    configureMailchimp();
    const listId = process.env.MAILCHIMP_LIST_ID;

    if (!listId) {
      return NextResponse.json(
        {
          success: false,
          totalEmails: 0,
          successCount: 0,
          errorCount: 0,
          message: 'Mailchimp list ID not configured',
        },
        { status: 500 },
      );
    }

    // 3. Connect to database and fetch emails
    await connectToDB();
    const marketingEmails = await MarketingEmail.find({}).lean();

    if (!marketingEmails || marketingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        totalEmails: 0,
        successCount: 0,
        errorCount: 0,
        message: 'No emails to export',
      });
    }

    // 4. Validate and prepare emails
    const validEmails: Array<{ email: string; createdAt: Date }> = [];
    const invalidEmails: Array<{ email: string; error: string }> = [];

    for (const record of marketingEmails) {
      const email = record.email?.trim().toLowerCase();

      if (!email) {
        invalidEmails.push({ email: record.email || 'empty', error: 'Empty email' });
        continue;
      }

      if (!EMAIL_REGEX.test(email)) {
        invalidEmails.push({ email, error: 'Invalid email format' });
        continue;
      }

      validEmails.push({
        email,
        createdAt: record.createdAt || new Date(),
      });
    }

    // 5. Batch add/update members to Mailchimp
    const errors: Array<{ email: string; error: string }> = [...invalidEmails];
    let successCount = 0;

    // Mailchimp batch operations - process in chunks of 500 (Mailchimp limit)
    const BATCH_SIZE = 500;

    for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
      const batch = validEmails.slice(i, i + BATCH_SIZE);

      const operations = batch.map((item) => ({
        method: 'PUT' as const,
        path: `/lists/${listId}/members/${getMd5Hash(item.email)}`,
        body: JSON.stringify({
          email_address: item.email,
          status_if_new: 'subscribed',
          status: 'subscribed',
          merge_fields: {
            SOURCE: 'promo_code',
          },
          timestamp_signup: item.createdAt.toISOString(),
        }),
      }));

      try {
        const response = await mailchimp.batches.start({
          operations,
        });

        // Wait a moment for batch to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check batch status
        if (response.id) {
          const batchStatus = await mailchimp.batches.status(response.id);

          if (batchStatus.finished_operations) {
            successCount += batchStatus.finished_operations - (batchStatus.errored_operations || 0);

            if (batchStatus.errored_operations && batchStatus.errored_operations > 0) {
              // Note: detailed error tracking would require parsing response file
              for (let j = 0; j < batchStatus.errored_operations && j < batch.length; j++) {
                errors.push({
                  email: batch[j].email,
                  error: 'Mailchimp batch error',
                });
              }
            }
          }
        }
      } catch {
        // Fallback: try individual adds for this batch
        for (const item of batch) {
          try {
            await mailchimp.lists.setListMember(listId, getMd5Hash(item.email), {
              email_address: item.email,
              status_if_new: 'subscribed',
              status: 'subscribed',
              merge_fields: {
                SOURCE: 'promo_code',
              },
            });
            successCount++;
          } catch (memberError: any) {
            errors.push({
              email: item.email,
              error: memberError?.message || 'Failed to add member',
            });
          }
        }
      }
    }

    const errorCount = errors.length;

    return NextResponse.json({
      success: true,
      totalEmails: marketingEmails.length,
      successCount,
      errorCount,
      errors: errorCount > 0 ? errors.slice(0, 100) : undefined, // Limit errors in response
      message: `Successfully exported ${successCount} out of ${marketingEmails.length} emails`,
    });
  } catch {
    // Production-safe error handling - no console logs
    return NextResponse.json(
      {
        success: false,
        totalEmails: 0,
        successCount: 0,
        errorCount: 0,
        message: 'Failed to export emails to Mailchimp',
      },
      { status: 500 },
    );
  }
});

/**
 * Generate MD5 hash for email (required by Mailchimp API)
 */
function getMd5Hash(email: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

#!/usr/bin/env node

/**
 * Mailchimp Export CLI Script
 * 
 * Standalone Node.js script for exporting marketing emails to Mailchimp
 * Can be run from command line or as scheduled task
 * 
 * Usage:
 *   node scripts/mailchimp-export.js
 *   npm run mailchimp:export
 * 
 * Requirements:
 *   - .env.local with API_SECRET_KEY, MAILCHIMP_API_KEY, etc.
 *   - MongoDB connection string
 * 
 * Features:
 *   - Fetches statistics before export
 *   - Calls /api/mailchimp/export endpoint
 *   - Detailed console logging
 *   - Error handling with exit codes
 *   - Production-ready with proper TypeScript types
 */

import https from 'node:https';
import http from 'node:http';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const API_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET_KEY;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Make HTTP request
 */
async function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${path}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
    };

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(jsonData.message || `HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Print colored console output
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Fetch and display statistics
 */
async function fetchStats() {
  try {
    log('\n📊 Fetching database statistics...', 'cyan');
    
    const stats = await makeRequest('/api/mailchimp/stats', 'GET');
    
    if (!stats.success) {
      throw new Error('Failed to fetch statistics');
    }

    log(`\n${colors.bright}Database Statistics:${colors.reset}`, 'blue');
    log(`  Total Emails: ${colors.bright}${stats.totalCount}${colors.reset}`, 'blue');
    
    if (stats.bySource && stats.bySource.length > 0) {
      log('\n  By Source:', 'blue');
      stats.bySource.forEach(source => {
        log(`    - ${source.source}: ${colors.bright}${source.count}${colors.reset}`, 'blue');
      });
    }

    if (stats.recentEmails && stats.recentEmails.length > 0) {
      log('\n  Recent Emails (last 10):', 'blue');
      stats.recentEmails.slice(0, 5).forEach(email => {
        const date = new Date(email.createdAt).toLocaleDateString();
        log(`    - ${email.email} (${email.source}, ${date})`, 'blue');
      });
    }

    return stats;
  } catch (error) {
    log(`\n❌ Failed to fetch statistics: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Execute Mailchimp export
 */
async function executeExport() {
  try {
    log('\n🚀 Starting Mailchimp export...', 'cyan');
    log('   This may take a few minutes for large lists.\n', 'yellow');

    const startTime = Date.now();
    
    // Call export API
    const result = await makeRequest('/api/mailchimp/export', 'POST');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Display results
    log(`\n${colors.bright}✅ Export Completed${colors.reset}`, 'green');
    log(`   Duration: ${duration}s`, 'green');
    log(`\n${colors.bright}Results:${colors.reset}`, 'green');
    log(`  Total Emails:   ${colors.bright}${result.totalEmails}${colors.reset}`, 'green');
    log(`  Success Count:  ${colors.bright}${colors.green}${result.successCount}${colors.reset}`, 'green');
    log(`  Error Count:    ${colors.bright}${result.errorCount > 0 ? colors.red : colors.green}${result.errorCount}${colors.reset}`, result.errorCount > 0 ? 'red' : 'green');

    if (result.message) {
      log(`\n  ${result.message}`, 'green');
    }

    // Display errors if any
    if (result.errors && result.errors.length > 0) {
      log(`\n${colors.bright}⚠️  Errors (showing first 20):${colors.reset}`, 'yellow');
      result.errors.slice(0, 20).forEach((err, idx) => {
        log(`  ${idx + 1}. ${err.email} - ${err.error}`, 'yellow');
      });
      
      if (result.errors.length > 20) {
        log(`  ... and ${result.errors.length - 20} more errors`, 'yellow');
      }
    }

    // Success/warning exit based on error count
    if (result.errorCount > 0 && result.successCount === 0) {
      log('\n❌ Export completed with errors. No emails were exported.', 'red');
      process.exit(1);
    } else if (result.errorCount > 0) {
      log('\n⚠️  Export completed with some errors. Check logs above.', 'yellow');
      process.exit(0);
    } else {
      log('\n✅ Export completed successfully!', 'green');
      process.exit(0);
    }

  } catch (error) {
    log(`\n❌ Export failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  // Validate environment
  if (!API_SECRET) {
    log('❌ Error: API_SECRET_KEY not found in environment variables', 'red');
    log('   Make sure .env.local is configured correctly', 'red');
    process.exit(1);
  }

  log('\n' + colors.bright + '═'.repeat(60) + colors.reset, 'cyan');
  log(`${colors.bright}  Mailchimp Email Export Script${colors.reset}`, 'cyan');
  log(colors.bright + '═'.repeat(60) + colors.reset + '\n', 'cyan');

  log(`API URL: ${API_URL}`, 'cyan');
  log(`API Key: ${API_SECRET.substring(0, 8)}...`, 'cyan');

  // 1. Fetch and display statistics
  const stats = await fetchStats();
  
  if (!stats || stats.totalCount === 0) {
    log('\n⚠️  No emails found in database. Nothing to export.', 'yellow');
    process.exit(0);
  }

  // 2. Confirm export
  log('\n⏳ Starting export in 3 seconds... (Press Ctrl+C to cancel)', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 3. Execute export
  await executeExport();
}

// Handle process signals
process.on('SIGINT', () => {
  log('\n\n⚠️  Export cancelled by user', 'yellow');
  process.exit(130);
});

process.on('uncaughtException', (error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Run script
main();

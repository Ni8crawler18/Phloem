/**
 * Eigensparse SDK - Node.js Integration Example
 *
 * This example demonstrates how to integrate the Eigensparse SDK
 * into a Node.js/Express backend application.
 *
 * Usage:
 *   1. Set EIGENSPARSE_API_KEY environment variable
 *   2. Run: node nodejs-integration.js
 */

const Eigensparse = require('../dist/eigensparse.min.js');

// Configuration
const config = {
  baseUrl: process.env.EIGENSPARSE_API_URL || 'http://localhost:8000/api',
  apiKey: process.env.EIGENSPARSE_API_KEY,
  debug: true,
};

// Initialize the SDK client
const client = Eigensparse.createClient(config);

/**
 * Example 1: Check if user has consented before processing data
 */
async function processUserData(userEmail) {
  console.log('\n=== Processing User Data ===');
  console.log(`User: ${userEmail}`);

  try {
    // Check consent status
    const consentStatus = await client.checkConsent(userEmail);

    if (!consentStatus.has_consent) {
      console.log('❌ User has not provided consent');
      console.log('Cannot process user data without consent');
      return false;
    }

    console.log('✓ User has provided consent');
    console.log('Active consents:', consentStatus.consents.length);

    // Log consent details
    consentStatus.consents.forEach((consent) => {
      console.log(`  - ${consent.purpose_name} (expires: ${consent.expires_at || 'never'})`);
    });

    // Process data...
    console.log('Processing user data...');
    return true;
  } catch (error) {
    console.error('Error checking consent:', error.message);
    return false;
  }
}

/**
 * Example 2: Check consent for a specific purpose
 */
async function checkSpecificConsent(userEmail, purposeUuid) {
  console.log('\n=== Checking Specific Purpose Consent ===');

  try {
    const hasConsent = await client.hasConsent(userEmail, purposeUuid);

    if (hasConsent) {
      console.log(`✓ User has consented to purpose: ${purposeUuid}`);
    } else {
      console.log(`❌ User has NOT consented to purpose: ${purposeUuid}`);
    }

    return hasConsent;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

/**
 * Example 3: List all purposes for your organization
 */
async function listPurposes() {
  console.log('\n=== Listing All Purposes ===');

  try {
    const purposes = await client.getPurposes();

    console.log(`Found ${purposes.length} purpose(s):\n`);

    purposes.forEach((purpose, index) => {
      console.log(`${index + 1}. ${purpose.name}`);
      console.log(`   UUID: ${purpose.uuid}`);
      console.log(`   Description: ${purpose.description}`);
      console.log(`   Legal Basis: ${purpose.legal_basis}`);
      console.log(`   Retention: ${purpose.retention_period_days} days`);
      console.log(`   Data Categories: ${purpose.data_categories.join(', ')}`);
      console.log(`   Mandatory: ${purpose.is_mandatory ? 'Yes' : 'No'}`);
      console.log('');
    });

    return purposes;
  } catch (error) {
    console.error('Error listing purposes:', error.message);
    return [];
  }
}

/**
 * Example 4: Express.js middleware for consent verification
 */
function consentMiddleware(purposeUuid) {
  return async (req, res, next) => {
    const userEmail = req.user?.email; // Assumes authenticated user

    if (!userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const hasConsent = await client.hasConsent(userEmail, purposeUuid);

      if (!hasConsent) {
        return res.status(403).json({
          error: 'Consent required',
          message: 'User has not consented to this data processing purpose',
          purpose_uuid: purposeUuid,
        });
      }

      next();
    } catch (error) {
      console.error('Consent check failed:', error.message);
      return res.status(500).json({ error: 'Consent verification failed' });
    }
  };
}

/**
 * Example 5: Batch consent checking
 */
async function checkBatchConsents(users) {
  console.log('\n=== Batch Consent Check ===');

  const results = await Promise.all(
    users.map(async (email) => {
      try {
        const status = await client.checkConsent(email);
        return { email, hasConsent: status.has_consent, consents: status.consents };
      } catch (error) {
        return { email, hasConsent: false, error: error.message };
      }
    })
  );

  console.log('Results:');
  results.forEach((r) => {
    const status = r.hasConsent ? '✓' : '❌';
    console.log(`  ${status} ${r.email}: ${r.hasConsent ? r.consents.length + ' consents' : 'no consent'}`);
  });

  return results;
}

// Main execution
async function main() {
  console.log('========================================');
  console.log('Eigensparse SDK - Node.js Examples');
  console.log('========================================');
  console.log(`API URL: ${config.baseUrl}`);
  console.log(`API Key: ${config.apiKey ? '****' + config.apiKey.slice(-8) : 'NOT SET'}`);

  if (!config.apiKey) {
    console.error('\n⚠️  Warning: EIGENSPARSE_API_KEY environment variable not set');
    console.log('Set it with: export EIGENSPARSE_API_KEY=your-api-key');
    return;
  }

  // Run examples
  await listPurposes();
  await processUserData('test@example.com');
  await checkBatchConsents(['user1@example.com', 'user2@example.com', 'test@example.com']);

  console.log('\n========================================');
  console.log('Examples completed');
  console.log('========================================');
}

main().catch(console.error);

// Export for use as module
module.exports = {
  client,
  consentMiddleware,
  processUserData,
  checkSpecificConsent,
  listPurposes,
  checkBatchConsents,
};

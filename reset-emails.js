// Simple script to reset the test email addresses
// Run this after deployment with: node reset-emails.js

const PRODUCTION_URL = 'https://thegoodloosecoins.vercel.app';

const resetEmail = async (email) => {
  try {
    console.log(`Resetting ${email}...`);
    const response = await fetch(`${PRODUCTION_URL}/api/auth/reset-user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${email}: ${data.message}`);
    } else {
      console.log(`❌ ${email}: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ ${email}: Network error - ${error.message}`);
  }
};

const resetBothEmails = async () => {
  console.log('Resetting test email addresses...\n');
  
  await resetEmail('fernandez.cherwin@gmail.com');
  await resetEmail('kreativloops@gmail.com');
  
  console.log('\nBoth email addresses have been processed.');
  console.log('You can now try signing up with these emails again.');
};

// Run if called directly
if (require.main === module) {
  resetBothEmails();
}

module.exports = { resetBothEmails };
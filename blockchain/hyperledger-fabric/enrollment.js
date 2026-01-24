const { Wallets, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

/**
 * Enroll admin user with the CA
 */
async function enrollAdmin() {
  try {
    console.log('Enrolling admin...');

    // Create CA client
    const caURL = process.env.FABRIC_CA_URL || 'http://localhost:7054';
    const ca = new FabricCAServices(caURL);

    // Create wallet
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin already enrolled
    const adminIdentity = await wallet.get('admin');
    if (adminIdentity) {
      console.log('Admin already enrolled');
      return;
    }

    // Enroll admin user
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw'
    });

    // Create admin identity
    const identity = X509WalletMixin.createIdentity(
      'DefaultMSP',
      enrollment.certificate,
      enrollment.key.toBytes()
    );

    // Store in wallet
    await wallet.put('admin', identity);
    console.log('Admin enrolled and stored in wallet');
  } catch (error) {
    console.error('Error enrolling admin:', error);
    process.exit(1);
  }
}

/**
 * Register and enroll application user
 */
async function registerAndEnrollUser() {
  try {
    console.log('Registering and enrolling app user...');

    // Create CA client
    const caURL = process.env.FABRIC_CA_URL || 'http://localhost:7054';
    const ca = new FabricCAServices(caURL);

    // Create wallet
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Get admin identity
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log('Admin user does not exist. First run enrollAdmin.js');
      return;
    }

    // Check if user already registered
    const userIdentity = await wallet.get('appUser');
    if (userIdentity) {
      console.log('App user already enrolled');
      return;
    }

    // Get admin user context
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Register user
    const secret = await ca.register(
      {
        affiliation: 'org1.department1',
        enrollmentID: 'appUser',
        enrollmentSecret: 'appUserpw',
        role: 'client'
      },
      adminUser
    );

    // Enroll user
    const enrollment = await ca.enroll({
      enrollmentID: 'appUser',
      enrollmentSecret: secret
    });

    // Create user identity
    const identity = X509WalletMixin.createIdentity(
      'DefaultMSP',
      enrollment.certificate,
      enrollment.key.toBytes()
    );

    // Store in wallet
    await wallet.put('appUser', identity);
    console.log('App user registered and enrolled');
  } catch (error) {
    console.error('Error registering and enrolling app user:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  await enrollAdmin();
  await registerAndEnrollUser();
}

if (require.main === module) {
  main();
}

module.exports = { enrollAdmin, registerAndEnrollUser };

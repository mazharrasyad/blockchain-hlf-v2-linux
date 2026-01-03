require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Helper: connect to Fabric
async function getContract() {
  const ccpPath = path.resolve(__dirname, '../network/connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: process.env.HLF_USER_ID || 'appUser',
    discovery: { enabled: true, asLocalhost: true },
  });
  const network = await gateway.getNetwork(process.env.HLF_CHANNEL_NAME || 'mychannel');
  return network.getContract(process.env.HLF_CHAINCODE_NAME || 'evoting');
}

// Example: Get all elections
app.get('/api/elections', async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction('GetAllElections');
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: Create election
app.post('/api/elections', async (req, res) => {
  try {
    const { id, title, description, endDate } = req.body;
    const contract = await getContract();
    await contract.submitTransaction('CreateElection', id, title, description, endDate);
    res.json({ message: 'Election created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add more CRUD endpoints for candidate, voter, voting, etc.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`E-Voting backend API listening on port ${PORT}`);
});

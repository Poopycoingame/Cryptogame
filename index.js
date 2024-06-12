const express = require('express');
const bodyParser = require('body-parser');
const TonWeb = require('tonweb');
const cors = require('cors');  // Add CORS support

const app = express();
app.use(cors());  // Enable CORS
app.use(bodyParser.json());

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

// Replace with your TON wallet private key and address
const walletPrivateKey = 'YOUR_WALLET_PRIVATE_KEY';
const walletAddress = 'YOUR_WALLET_ADDRESS';

// Initialize the wallet
const wallet = tonweb.wallet.create({
    publicKey: TonWeb.utils.base64ToBytes(walletPrivateKey),
    wc: 0 // workchain
});

// Replace with your custom token contract address
const customTokenAddress = 'YOUR_CUSTOM_TOKEN_CONTRACT_ADDRESS';

// Endpoint for payout
app.post('/payout', async (req, res) => {
    const { score, wallet } = req.body;
    if (!score || !wallet) {
        return res.json({ success: false, message: 'Invalid request' });
    }

    const tokenAmount = score * 0.001; // Define the conversion rate from points to custom tokens

    try {
        // Construct the transfer message for the custom token
        const transferMessage = tonweb.contract.createTransferMessage({
            to: wallet,
            amount: tokenAmount,
            seqno: await wallet.methods.getSeqno().call(),
        });

        // Send the transfer message
        const seqno = await wallet.methods.transfer({
            secretKey: TonWeb.utils.base64ToBytes(walletPrivateKey),
            toAddress: customTokenAddress,
            amount: TonWeb.utils.toNano('0.01'), // Typically a small amount of TON is required for the transaction fee
            payload: transferMessage,
            sendMode: 3
        }).send();

        res.json({ success: true, seqno: seqno });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Endpoint for login (optional, can be used to verify wallet)
app.post('/login', (req, res) => {
    const { wallet } = req.body;
    if (!wallet) {
        return res.json({ success: false, message: 'Wallet address is required' });
    }
    // Additional logic for login can be added here
    res.json({ success: true, message: 'Login successful' });
});

// Endpoint for saving game state
app.post('/save', (req, res) => {
    const { score, wallet } = req.body;
    if (!wallet) {
        return res.json({ success: false, message: 'Wallet address is required' });
    }
    // Save the score and other game state data to your database here
    res.json({ success: true, message: 'Game state saved' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

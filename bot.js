const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Telegram bot token
const token = '7052486213:AAGLpnMZIJUloysFqd-FyVGYQmPheHA7ITg';
const bot = new TelegramBot(token, { polling: true });

app.use(bodyParser.json());
app.use(cors());

let users = {};

// Handler for '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const text = 'Welcome! Click the button below to login to the game.';
    
    // Create an inline keyboard with a button that includes a start parameter
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Login to Game',
                        url: `https://your-game-url.com/login?telegramId=${chatId}`
                    }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, text, opts);
});

// Endpoint for login to save the telegramId
app.post('/login', (req, res) => {
    const { telegramId } = req.body;
    if (!telegramId) {
        return res.json({ success: false, message: 'Invalid request' });
    }
    users[telegramId] = { telegramId };
    res.json({ success: true });
});

// Endpoint for payout
app.post('/payout', async (req, res) => {
    const { score, telegramId } = req.body;
    if (!score || !telegramId) {
        return res.json({ success: false, message: 'Invalid request' });
    }

    const tokenAmount = score * 0.001;

    try {
        // Notify the user via Telegram
        await bot.sendMessage(telegramId, `You have received a payout of ${tokenAmount} tokens!`);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

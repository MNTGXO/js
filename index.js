const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

// Load environment variables (for local development)
require('dotenv').config();

// Initialize Express app for Koyeb health checks
const app = express();
const port = process.env.PORT || 3000;

// Your bot token from @BotFather
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.start((ctx) => {
  const welcomeMessage = `
👋 Hello, ${ctx.from.first_name}!

I'm a Telegram bot running on Koyeb. Here's what I can do:

/start - Show this message
/help - Show help information
/echo [text] - Echo back your text
/joke - Tell a random joke
/about - Show information about this bot

You can customize me to do much more!
`;
  ctx.reply(welcomeMessage);
});

// Help command
bot.help((ctx) => {
  ctx.reply(`
Available commands:

/start - Start the bot
/help - Show this help message
/echo [text] - Repeat the text you send
/joke - Get a random joke
/about - Learn about this bot

More features can be added as needed!
`);
});

// Echo command
bot.command('echo', (ctx) => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');
  if (!input) {
    return ctx.reply('Please provide some text after /echo');
  }
  ctx.reply(`You said: ${input}`);
});

// Joke command
bot.command('joke', async (ctx) => {
  try {
    ctx.reply('Let me think of a good one...');
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    const joke = `${response.data.setup}\n\n...${response.data.punchline}`;
    ctx.reply(joke);
  } catch (error) {
    console.error('Error fetching joke:', error);
    ctx.reply("Sorry, I couldn't think of a joke right now. Try again later!");
  }
});

// About command
bot.command('about', (ctx) => {
  ctx.reply(`
🤖 Koyeb Telegram Bot

This is a sample Telegram bot running on Koyeb's cloud platform. 

Features:
- Built with Node.js and Telegraf
- Deployed on Koyeb
- Easy to extend with new commands

You can customize this bot to do much more!
`);
});

// Handle any other text messages
bot.on('text', (ctx) => {
  ctx.reply(`I received your message: "${ctx.message.text}". Try /help to see what I can do.`);
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('Oops, something went wrong!');
});

// Start the bot (for polling mode - only for development)
if (process.env.NODE_ENV === 'development') {
  bot.launch();
  console.log('Bot is running in development mode (polling)');
}

// Set up Express server for Koyeb
app.get('/', (req, res) => {
  res.send('Telegram Bot is running on Koyeb');
});

// Start the Express server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
});

// For Koyeb deployment, we'll use webhooks
if (process.env.NODE_ENV === 'production') {
  const secretPath = `/telegraf/${bot.secretPathComponent()}`;
  bot.telegram.setWebhook(`${process.env.KOYEB_APP_URL}${secretPath}`);
  app.use(bot.webhookCallback(secretPath));
  console.log('Bot is running in production mode (webhook)');
}

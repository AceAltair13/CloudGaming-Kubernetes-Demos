const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");

const bot = mineflayer.createBot({
  host: process.env.SERVER_HOST || "tirththoria13.aternos.me",
  port: parseInt(process.env.SERVER_PORT) || 24866,
  username: "Bot_" + Math.floor(Math.random() * 1000),
  auth: "offline", // Ensure server is in offline mode
  version: "1.21",
});

// Load pathfinder plugin
bot.loadPlugin(pathfinder);

bot.on("spawn", () => {
  console.log(`Bot ${bot.username} has spawned in the game.`);
  bot.chat("Hello, I am a bot!");

  // Define movements
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);

  // Example: Move to a random position every minute
  setInterval(() => {
    const x = Math.floor(Math.random() * 100) - 50;
    const z = Math.floor(Math.random() * 100) - 50;
    const goal = new goals.GoalNear(x, 64, z, 5);
    bot.pathfinder.setGoal(goal);
    console.log(`${bot.username} is moving to (${x}, 64, ${z})`);
  }, 60000); // Every 60 seconds
});

// Additional event listeners...

bot.on("error", (err) => {
  console.log(`Error encountered: ${err}`);
});

bot.on("end", () => {
  console.log("Bot has disconnected from the server.");
});

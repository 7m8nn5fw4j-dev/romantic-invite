import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

let bot = null;
if (token) {
  bot = new TelegramBot(token, { polling: true });

  // Помогает получить числовой chat_id: отправьте боту /start.
  bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      `Бот подключён. Ваш chat_id: ${msg.chat.id}\nДобавьте это число в TELEGRAM_CHAT_ID в файле .env.`
    );
  });
}

app.post("/api/submit", async (req, res) => {
  const { accepted, date, activity, telegram } = req.body || {};

  if (accepted !== true) {
    return res.status(400).json({ error: "Нужно подтвердить согласие." });
  }
  if (!date || !activity?.trim() || !telegram?.trim()) {
    return res.status(400).json({ error: "Заполните все поля." });
  }
  if (!bot || !chatId || !/^-?\d+$/.test(chatId)) {
    return res.status(503).json({
      error: "Бот ещё не настроен. Добавьте токен и числовой chat_id в .env."
    });
  }

  const message =
    "💌 Новое приглашение — ответы с сайта\n\n" +
    "💗 Согласие: Да\n" +
    `📅 Дата: ${date}\n` +
    `✨ Чем хочет заняться: ${activity.trim()}\n` +
    `✈️ Telegram: ${telegram.trim()}`;

  try {
    await bot.sendMessage(chatId, message);
    res.json({ ok: true });
  } catch (error) {
    console.error("Telegram send error:", error.message);
    res.status(502).json({ error: "Не удалось отправить сообщение в Telegram." });
  }
});

app.listen(port, () => {
  console.log(`Сайт запущен: http://localhost:${port}`);
});
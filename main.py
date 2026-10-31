
import logging
import os

from telegram import ReplyKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    level=logging.INFO,
)
logging.getLogger("httpx").setLevel(logging.WARNING)


def main_menu():
    return ReplyKeyboardMarkup(
        [
            ["🌸 Каталог", "🛒 Как купить"],
            ["💬 Связаться", "📜 Правила"],
        ],
        resize_keyboard=True,
    )


SECTIONS = {
    "🌸 Каталог": (
        "🌸 Каталог «Нота 59»\n\n"
        "Скоро здесь появятся ароматы, объёмы и цены.\n"
        "Пока наличие можно уточнить у администратора группы."
    ),
    "🛒 Как купить": (
        "🛒 Как купить\n\n"
        "Для заказа обратитесь к администратору группы «Нота 59».\n"
        "Укажите название аромата и желаемый объём.\n\n"
        "До оплаты уточните наличие, стоимость и способ получения."
    ),
      "💬 Связаться": (
        "💬 Администратор «Нота 59»\n\n"
        "По вопросам наличия ароматов и оформления заказа:\n"
        "@kodenn88\n\n"
        "Написать лично: https://t.me/kodenn88"
    ),
    "📜 Правила": (
        "📜 Информация\n\n"
        "Условия заказа, оплаты и получения уточняйте "
        "у администратора до покупки.\n\n"
        "Полные правила группы добавим в этот раздел позже."
    ),
}


async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    message = update.effective_message
    if message is None:
        return

    await message.reply_text(
        "Добро пожаловать в «Нота 59»! 🌸\n\n"
        "Парфюмерия на распив.\n"
        "Выберите нужный раздел на клавиатуре ниже.",
        reply_markup=main_menu(),
    )


async def handle_message(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    message = update.effective_message
    if message is None:
        return

    text = SECTIONS.get(
        message.text,
        "Выберите раздел на клавиатуре ниже 🙂\n"
        "Чтобы открыть меню, отправьте /start.",
    )

    await message.reply_text(
        text,
        reply_markup=main_menu(),
    )


def main():
    token = os.environ.get("BOT_TOKEN", "").strip()

    if not token:
        raise RuntimeError(
            "Добавьте переменную BOT_TOKEN в настройках хостинга."
        )

    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("menu", start))
    application.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND & filters.ChatType.PRIVATE,
            handle_message,
        )
    )

    application.run_polling()


if __name__ == "__main__":
    main()

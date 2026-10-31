
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
        "🌸 CREED AVENTUS\n\n"
        "ЧЕМ ПАХНЕТ\n"
        "Свежий фруктово-древесный аромат: цитрусы, "
        "яблоко и чёрная смородина сочетаются "
        "с ананасовым акцентом. Далее — сухая древесина, "
        "мшистые и слегка дымные оттенки.\n\n"
        "ПИРАМИДА ПО FRAGRANTICA\n"
        "Верхние ноты: бергамот, чёрная смородина, "
        "яблоко, лимон, розовый перец.\n"
        "Сердце: ананас, пачули, марокканский жасмин.\n"
        "База: берёза, мускус, дубовый мох, "
        "кедр, Ambroxan.\n\n"
        "ОБЪЁМЫ И ЦЕНЫ\n"
        "280 ₽ за 1 мл\n"
        "• 5 мл — 1 400 ₽\n"
        "• 10 мл — 2 800 ₽\n\n"
        "Атомайзер включён в стоимость.\n\n"
        "Для заказа укажите аромат и объём:\n"
        "@kodenn88\n"
        "https://t.me/kodenn88"
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

    photo_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "aventus.jpg",
    )

    if message.text == "🌸 Каталог" and os.path.isfile(photo_path):
        with open(photo_path, "rb") as photo:
            await message.reply_photo(
                photo=photo,
                caption=text,
                reply_markup=main_menu(),
            )
        return

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

import logging
import os

from telegram import ReplyKeyboardMarkup, Update
from telegram.error import TelegramError
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


def catalog_menu():
    return ReplyKeyboardMarkup(
        [
            ["Creed Aventus"],
            ["Louis Vuitton Pacific Chill"],
            ["⬅️ Главное меню"],
        ],
        resize_keyboard=True,
    )


AVENTUS_TEXT = (
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
)


PACIFIC_CHILL_TEXT = (
    "🌸 LOUIS VUITTON PACIFIC CHILL\n\n"
    "На распив в объёмах 5 мл и 10 мл.\n\n"
    "Есть ароматы, которые пытаются произвести впечатление, "
    "а есть те, с которыми просто хорошо. "
    "Pacific Chill — про второе. Представьте неспешное утро "
    "в отпуске: впереди свободный день, а в руках — холодный "
    "фруктовый коктейль с растёртой между пальцами мятой.\n\n"
    "В его характере главное — сочность. Яркие цитрусы "
    "с лёгкой горчинкой цедры встречаются с прохладной мятой "
    "и смородиновой кислинкой. Но самое интересное здесь — "
    "абрикос: мягкий, спелый, с ощущением бархатистой мякоти. "
    "Базилик добавляет зелёную пряность и не даёт фруктовой "
    "сладости превратить композицию в обычный компот. "
    "Постепенно звучание становится спокойнее и мягче, "
    "проявляется инжирный оттенок. Такое прочтение опирается "
    "на заявленную пирамиду аромата.\n\n"
    "Это не строгий парфюм под костюм, а история про "
    "расслабленность, лёгкую рубашку и удовольствие "
    "от простых вещей. Для тех, кто любит свежесть, "
    "но хочет получить больше, чем просто лимон "
    "и чистоту после душа.\n\n"
    "Унисекс — для мужчин и женщин.\n\n"
    "💰 СТОИМОСТЬ\n"
    "• 5 мл — 1 800 ₽\n"
    "• 10 мл — 3 600 ₽\n\n"
    "Атомайзер включён в цену.\n\n"
    "Для заказа укажите аромат и объём:\n"
    "@kodenn88\n"
    "https://t.me/kodenn88"
)


PERFUMES = {
    "Creed Aventus": {
        "photo": "aventus.jpg",
        "text": AVENTUS_TEXT,
    },
    "Louis Vuitton Pacific Chill": {
        "photo": "pacific_chill.jpeg",
        "text": PACIFIC_CHILL_TEXT,
    },
}


SECTIONS = {
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

    user_text = message.text

    if user_text == "🌸 Каталог":
        await message.reply_text(
            "🌸 Каталог «Нота 59»\n\n"
            "Выберите аромат:",
            reply_markup=catalog_menu(),
        )
        return

    if user_text == "⬅️ Главное меню":
        await message.reply_text(
            "Выберите нужный раздел:",
            reply_markup=main_menu(),
        )
        return

    perfume = PERFUMES.get(user_text)

    if perfume is not None:
        photo_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            perfume["photo"],
        )

        if os.path.isfile(photo_path):
            try:
                with open(photo_path, "rb") as photo:
                    await message.reply_photo(
                        photo=photo,
                        caption=user_text,
                        reply_markup=catalog_menu(),
                    )
            except TelegramError:
                logging.exception(
                    "Не удалось отправить фото аромата %s",
                    user_text,
                )
        else:
            logging.warning(
                "Файл фотографии не найден: %s",
                photo_path,
            )

        await message.reply_text(
            perfume["text"],
            reply_markup=catalog_menu(),
        )
        return

    text = SECTIONS.get(
        user_text,
        "Выберите раздел на клавиатуре ниже 🙂\n"
        "Чтобы открыть меню, отправьте /start.",
    )

    await message.reply_text(
        text,
        reply_markup=main_menu(),
    )


async def group_rules(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    message = update.effective_message
    if message is None:
        return

    await message.reply_text(
        "📜 Информация группы «Нота 59»\n\n"
        "Здесь обсуждаем парфюмерию и распивы.\n\n"
        "Наличие, стоимость, оплату и получение "
        "уточняйте у администратора до покупки.\n\n"
        "Администратор: @kodenn88\n"
        "https://t.me/kodenn88"
    )


async def welcome_members(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    message = update.effective_message
    if message is None:
        return

    for member in message.new_chat_members:
        if member.is_bot:
            continue

        await message.reply_text(
            f"🌸 {member.first_name}, "
            "добро пожаловать в «Нота 59»!\n\n"
            "Рады видеть вас в нашем "
            "парфюмерном сообществе.\n\n"
            "Информация группы: /rules\n"
            "По вопросам заказов: @kodenn88"
        )


async def ban_spammer(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    message = update.effective_message
    chat = update.effective_chat
    user = update.effective_user

    if message is None or chat is None:
        return

    if chat.type not in ("group", "supergroup"):
        return

    if message.sender_chat is not None or user is None:
        await message.reply_text(
            "Отправьте команду от своего личного аккаунта, "
            "не анонимно и не от имени канала."
        )
        return

    try:
        moderator = await context.bot.get_chat_member(
            chat_id=chat.id,
            user_id=user.id,
        )

        allowed = (
            moderator.status == "creator"
            or (
                moderator.status == "administrator"
                and moderator.can_restrict_members
            )
        )

        if not allowed:
            await message.reply_text(
                "Команда доступна только владельцу группы "
                "и администраторам с правом блокировки."
            )
            return

        replied = message.reply_to_message

        if replied is None:
            await message.reply_text(
                "Ответьте на сообщение спамера командой /ban.\n"
                "Внимание: блокировка бессрочная."
            )
            return

        if replied.sender_chat is not None or replied.from_user is None:
            await message.reply_text(
                "Это сообщение отправлено от имени канала "
                "или анонимного администратора. "
                "Эта команда блокирует только пользователей."
            )
            return

        target = replied.from_user

        if target.id in (user.id, context.bot.id):
            await message.reply_text(
                "Нельзя заблокировать себя или этого бота."
            )
            return

        target_member = await context.bot.get_chat_member(
            chat_id=chat.id,
            user_id=target.id,
        )

        if target_member.status in ("creator", "administrator"):
            await message.reply_text(
                "Владельца группы и администраторов "
                "эта команда не блокирует."
            )
            return

        bot_member = await context.bot.get_chat_member(
            chat_id=chat.id,
            user_id=context.bot.id,
        )

        if (
            bot_member.status != "administrator"
            or not bot_member.can_restrict_members
        ):
            await message.reply_text(
                "Выдайте мне права администратора "
                "с разрешением блокировать пользователей."
            )
            return

        await context.bot.ban_chat_member(
            chat_id=chat.id,
            user_id=target.id,
        )

    except TelegramError:
        logging.exception("Не удалось выполнить команду /ban")
        await message.reply_text(
            "Не удалось выполнить блокировку. "
            "Проверьте права бота и логи BotHost."
        )
        return

    await message.reply_text(
        f"🚫 Пользователь {target.full_name} заблокирован.\n"
        f"ID: {target.id}\n\n"
        "Блокировка бессрочная. "
        "Снять её можно в настройках группы."
    )


def main():
    token = os.environ.get("BOT_TOKEN", "").strip()

    if not token:
        raise RuntimeError(
            "Добавьте переменную BOT_TOKEN в настройках хостинга."
        )

    application = Application.builder().token(token).build()

    application.add_handler(
        CommandHandler(
            "ban",
            ban_spammer,
            filters=filters.ChatType.GROUPS,
        )
    )

    application.add_handler(
        CommandHandler(
            "rules",
            group_rules,
            filters=filters.ChatType.GROUPS,
        )
    )

    application.add_handler(
        MessageHandler(
            filters.StatusUpdate.NEW_CHAT_MEMBERS
            & filters.ChatType.GROUPS,
            welcome_members,
        )
    )

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

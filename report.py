import logging
import time

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.error import TelegramError
from telegram.ext import ContextTypes

import security_log as slog

REPORT_LIMIT = 3
REPORT_WINDOW = 600


def report_keyboard():
    return InlineKeyboardMarkup([[InlineKeyboardButton('🚨 Пожаловаться', callback_data='report_help')]])


async def report_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query is None:
        return
    await query.answer()
    await query.message.reply_text('🚨 Чтобы пожаловаться, ответьте на подозрительное сообщение командой /report.\n\nЖалоба придёт администратору. Бот ничего не удаляет и не наказывает автоматически.')


def _allowed(context, user_id):
    log = context.bot_data.setdefault('report_log', {})
    now = time.monotonic()
    stamps = [stamp for stamp in log.get(user_id, []) if now - stamp <= REPORT_WINDOW]
    if len(stamps) >= REPORT_LIMIT:
        log[user_id] = stamps
        return False
    stamps.append(now)
    log[user_id] = stamps
    return True


async def report_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    import main as bot_main

    message = update.effective_message
    chat = update.effective_chat
    user = update.effective_user
    if message is None or chat is None:
        return
    if chat.type not in ('group', 'supergroup') or chat.id != bot_main.PROTECTED_GROUP_ID:
        await message.reply_text('Команда /report работает в группе «Нота 59». Ответьте ей на подозрительное сообщение.')
        return
    if message.sender_chat is not None or user is None:
        await message.reply_text('Отправьте /report от своего личного аккаунта, не анонимно и не от имени канала.')
        return
    if not _allowed(context, user.id):
        await message.reply_text('Слишком много жалоб за последние 10 минут. Попробуйте позже.')
        return

    replied = message.reply_to_message
    if replied is None:
        await message.reply_text('Ответьте на подозрительное сообщение командой /report.')
        return

    reported_user = replied.from_user
    reported_name = reported_user.full_name if reported_user else 'неизвестный отправитель'
    reported_id = reported_user.id if reported_user else 'неизвестно'
    sender_name = user.full_name
    sender_id = user.id
    message_text = (replied.text or replied.caption or '[текст или медиа без подписи]')[:500]
    message_link = f'https://t.me/c/{str(chat.id).removeprefix("-100")}/{replied.message_id}'

    notice = (
        '🚨 Жалоба в «Нота 59»\n\n'
        f'Чат: {chat.title or chat.id}\n'
        f'Сообщение: {message_link}\n\n'
        f'Автор сообщения: {reported_name}\n'
        f'ID автора: {reported_id}\n\n'
        f'Текст:\n{message_text}\n\n'
        f'Отправил жалобу: {sender_name}\n'
        f'ID отправителя: {sender_id}'
    )

    delivered = False
    try:
        await context.bot.send_message(bot_main.SECURITY_OWNER_ID, notice)
        delivered = True
    except TelegramError:
        logging.warning('Уведомление о жалобе не доставлено; откройте личный чат бота и нажмите /start')

    if delivered:
        slog.log_event('report', chat.id, user.id, f'Жалоба на {reported_id}; сообщение {replied.message_id}')
        await message.reply_text('✅ Жалоба отправлена администратору. Спасибо!')
    else:
        await message.reply_text('Жалоба принята, но уведомление владельцу пока не доставлено. Откройте личный чат с ботом и нажмите /start.')


def register(application):
    from telegram.ext import CommandHandler, CallbackQueryHandler
    import scent_picker
    import group_catalog

    scent_picker.register(application)
    group_catalog.register(application)
    application.add_handler(CommandHandler('report', report_command))
    application.add_handler(CallbackQueryHandler(report_help, pattern='^report_help$'))

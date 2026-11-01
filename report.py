import logging

from telegram import Update
from telegram.error import TelegramError
from telegram.ext import ContextTypes

import main as bot_main


async def report_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает /report: уведомляет владельца, не удаляет и не наказывает."""
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
        await message.reply_text('✅ Жалоба отправлена администратору. Спасибо!')
    else:
        await message.reply_text('Жалоба принята, но уведомление владельцу пока не доставлено. Откройте личный чат с ботом и нажмите /start.')


def register(application):
    """Подключает обработчик /report к существующему приложению."""
    from telegram.ext import CommandHandler

    application.add_handler(CommandHandler('report', report_command))

import os
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import security_log as slog
import main as bot


def make_warn():
    message = MagicMock()
    message.reply_text = AsyncMock()
    message.sender_chat = None
    message.reply_to_message = SimpleNamespace(
        from_user=SimpleNamespace(id=333, full_name='Нарушитель'),
        message_id=777,
        sender_chat=None,
    )
    chat = SimpleNamespace(id=-5479944910, type='supergroup')
    user = SimpleNamespace(id=222, full_name='Админ')
    api = SimpleNamespace(
        id=999,
        get_chat_member=AsyncMock(return_value=SimpleNamespace(status='administrator', can_restrict_members=True)),
    )
    update = SimpleNamespace(effective_message=message, effective_chat=chat, effective_user=user)
    context = SimpleNamespace(bot=api, bot_data={}, args=['спам'])
    return message, update, context


class WarnTests(unittest.IsolatedAsyncioTestCase):
    async def test_warn_requires_reply(self):
        message, update, context = make_warn()
        update.effective_message.reply_to_message = None
        await bot.warn_spammer(update, context)
        self.assertIn('Ответьте', message.reply_text.call_args.args[0])

    async def test_warn_flood(self):
        for _ in range(5):
            message, update, context = make_warn()
            await bot.warn_spammer(update, context)
        message, update, context = make_warn()
        await bot.warn_spammer(update, context)
        self.assertIn('Слишком много команд /warn', message.reply_text.call_args.args[0])


class SecurityLogTests(unittest.TestCase):
    def test_log_roundtrip(self):
        with tempfile.TemporaryDirectory() as tmp:
            original = slog.DB_PATH
            slog.DB_PATH = os.path.join(tmp, 'test.db')
            try:
                slog.init()
                slog.log_event('warn', -1, 333, 'тест')
                rows = slog.recent(1)
                self.assertEqual(rows[0][1], 'warn')
                self.assertEqual(rows[0][3], 333)
                self.assertEqual(slog.count_kind_for_user('warn', 333), 1)
            finally:
                slog.DB_PATH = original


if __name__ == '__main__':
    unittest.main()

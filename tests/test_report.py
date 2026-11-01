import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import report


def make_report():
    message = MagicMock()
    message.reply_text = AsyncMock()
    message.sender_chat = None
    message.reply_to_message = SimpleNamespace(
        from_user=SimpleNamespace(id=333, full_name='Плохой участник'),
        message_id=555,
        text='реклама',
        caption=None,
    )
    chat = SimpleNamespace(id=-5479944910, type='supergroup', title='Нота 59')
    user = SimpleNamespace(id=222, full_name='Дэн')
    api = SimpleNamespace(send_message=AsyncMock())
    update = SimpleNamespace(effective_message=message, effective_chat=chat, effective_user=user)
    context = SimpleNamespace(bot=api, bot_data={})
    return message, update, context


class ReportTests(unittest.IsolatedAsyncioTestCase):
    async def test_report_limit(self):
        for _ in range(3):
            message, update, context = make_report()
            await report.report_command(update, context)
        message, update, context = make_report()
        await report.report_command(update, context)
        self.assertEqual(context.bot.send_message.await_count, 3)
        self.assertIn('Слишком много жалоб', message.reply_text.call_args.args[0])

    async def test_report_without_reply(self):
        message, update, context = make_report()
        update.effective_message.reply_to_message = None
        await report.report_command(update, context)
        context.bot.send_message.assert_not_awaited()
        self.assertIn('Ответьте', message.reply_text.call_args.args[0])

    async def test_report_button(self):
        query = SimpleNamespace(answer=AsyncMock(), message=SimpleNamespace(reply_text=AsyncMock()))
        update = SimpleNamespace(callback_query=query)
        context = SimpleNamespace(bot_data={})
        await report.report_help(update, context)
        query.answer.assert_awaited_once()
        self.assertIn('/report', query.message.reply_text.call_args.args[0])


if __name__ == '__main__':
    unittest.main()

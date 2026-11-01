import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from telegram import MessageEntity
from telegram.error import TelegramError
from telegram.ext import ApplicationHandlerStop

import main as bot


class LinkValidationTests(unittest.TestCase):
    def test_allowed_urls(self):
        for url in [
            'https://fragrantica.ru/perfume/test',
            'https://www.fragrantica.ru/test',
            'https://randewoo.ru/product/test',
            'HTTPS://WWW.RANDEWOO.RU/test',
            'randewoo.ru/product',
            'https://sub.randewoo.ru/test',
            'https://fragrantica.ru:443/test',
        ]:
            with self.subTest(url=url):
                self.assertTrue(bot.link_is_allowed(url))

    def test_forbidden_or_ambiguous_urls(self):
        for url in [
            'https://example.com',
            'https://fakefragrantica.ru',
            'https://fragrantica.ru.example.com',
            'https://fragrantica.ru@example.com',
            'https://example.com/?site=randewoo.ru',
            'https://randewoo.ru:8443/test',
            'ftp://randewoo.ru/test',
            'https://randewoo.ru./test',
            'https://randewoo.ru\\@example.com',
            'https://rаndewoo.ru',
            'https://randewoo.ru/\u200btest',
            ' https://randewoo.ru',
            'https://randewoo.ru:bad',
            '', None,
        ]:
            with self.subTest(url=url):
                self.assertFalse(bot.link_is_allowed(url))

    def test_extract_visible_hidden_and_caption_links(self):
        m = MagicMock()
        visible = MessageEntity(MessageEntity.URL, 0, 10)
        hidden = MessageEntity(MessageEntity.TEXT_LINK, 12, 5, url='https://example.com')
        caption = MessageEntity(MessageEntity.URL, 0, 10)
        m.parse_entities.return_value = {visible: 'https://randewoo.ru', hidden: 'Обзор'}
        m.parse_caption_entities.return_value = {caption: 'https://fragrantica.ru'}
        self.assertEqual(bot.message_links(m), {
            'https://randewoo.ru', 'https://example.com', 'https://fragrantica.ru',
        })


class CatalogTests(unittest.TestCase):
    def test_catalog_not_lost(self):
        self.assertEqual(len(bot.PERFUMES), 20)
        self.assertEqual(bot.PERFUMES['Creed Aventus']['price5'], 1400)
        self.assertEqual(bot.PERFUMES['Louis Vuitton Pacific Chill']['price10'], 3600)
        self.assertEqual(bot.PERFUMES['Tom Ford Grey Vetiver EDP']['price10'], 1800)
        self.assertEqual(len(bot.NAME_WORDS), len(bot.NAMES))
        self.assertEqual(set(bot.BRAND_OF), set(bot.PERFUMES))

    def test_search(self):
        self.assertEqual(len(bot.find_perfumes('авентус')), 2)
        self.assertEqual(len(bot.find_perfumes('ИНТЕРЛЮД')), 2)
        self.assertEqual(len(bot.find_perfumes('том форд')), 4)
        self.assertEqual(len(bot.find_perfumes('Tom Ford')), 4)
        self.assertEqual(bot.find_perfumes(''), [])
        self.assertEqual(bot.find_perfumes('неттакогоаромата'), [])


def make_event(urls, status='member', chat_id=None):
    m = MagicMock()
    m.message_id = 100
    m.edit_date = None
    m.sender_chat = None
    m.from_user = SimpleNamespace(id=222)
    m.delete = AsyncMock()
    m.parse_entities.return_value = {
        MessageEntity(MessageEntity.TEXT_LINK, i * 2, 1, url=url): 'x'
        for i, url in enumerate(urls)
    }
    m.parse_caption_entities.return_value = {}
    chat = SimpleNamespace(id=chat_id if chat_id is not None else bot.PROTECTED_GROUP_ID, type='supergroup')
    api = SimpleNamespace(
        id=999,
        get_chat_member=AsyncMock(return_value=SimpleNamespace(status=status)),
        send_message=AsyncMock(),
        ban_chat_member=AsyncMock(),
        restrict_chat_member=AsyncMock(),
    )
    update = SimpleNamespace(effective_message=m, effective_chat=chat)
    context = SimpleNamespace(bot=api, bot_data={'link_filter_enabled': True})
    return m, update, context


class ModerationTests(unittest.IsolatedAsyncioTestCase):
    async def test_allowed_link_not_deleted(self):
        m, update, context = make_event(['https://fragrantica.ru/test'])
        await bot.group_link_filter(update, context)
        m.delete.assert_not_awaited()

    async def test_mixed_links_deleted_without_mute_or_ban(self):
        m, update, context = make_event(['https://randewoo.ru', 'https://example.com'])
        with self.assertRaises(ApplicationHandlerStop):
            await bot.group_link_filter(update, context)
        m.delete.assert_awaited_once()
        context.bot.ban_chat_member.assert_not_awaited()
        context.bot.restrict_chat_member.assert_not_awaited()
        notice = context.bot.send_message.call_args.args[1]
        self.assertNotIn('https://example.com', notice)

    async def test_admin_exempt(self):
        for status in ['creator', 'administrator']:
            m, update, context = make_event(['https://example.com'], status=status)
            await bot.group_link_filter(update, context)
            m.delete.assert_not_awaited()

    async def test_other_group_ignored(self):
        m, update, context = make_event(['https://example.com'], chat_id=-123)
        await bot.group_link_filter(update, context)
        m.delete.assert_not_awaited()
        context.bot.get_chat_member.assert_not_awaited()

    async def test_permission_lookup_failure_does_not_delete(self):
        m, update, context = make_event(['https://example.com'])
        context.bot.get_chat_member.side_effect = TelegramError('test failure')
        await bot.group_link_filter(update, context)
        m.delete.assert_not_awaited()
        context.bot.send_message.assert_awaited_once()

    async def test_delete_failure_is_not_reported_as_success(self):
        m, update, context = make_event(['https://example.com'])
        m.delete.side_effect = TelegramError('test failure')
        with self.assertRaises(ApplicationHandlerStop):
            await bot.group_link_filter(update, context)
        notice = context.bot.send_message.call_args.args[1]
        self.assertIn('не удалено', notice)
        self.assertFalse(context.bot_data.get('link_filter_recent'))

    async def test_edit_is_checked(self):
        m, update, context = make_event(['https://example.com'])
        m.edit_date = datetime.now(timezone.utc)
        with self.assertRaises(ApplicationHandlerStop):
            await bot.group_link_filter(update, context)
        m.delete.assert_awaited_once()

    async def test_disabled_filter_does_not_delete(self):
        m, update, context = make_event(['https://example.com'])
        context.bot_data['link_filter_enabled'] = False
        await bot.group_link_filter(update, context)
        m.delete.assert_not_awaited()

    async def test_wrong_group_at_start_keeps_filter_disabled(self):
        api = SimpleNamespace(
            get_chat=AsyncMock(return_value=SimpleNamespace(id=-123, type='supergroup')),
            send_message=AsyncMock(),
        )
        app = SimpleNamespace(bot=api, bot_data={})
        await bot.check_security(app)
        self.assertFalse(app.bot_data['link_filter_enabled'])
        api.send_message.assert_awaited_once()


if __name__ == '__main__':
    unittest.main()

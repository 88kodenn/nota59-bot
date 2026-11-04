"""Shared inline catalogue for the configured group only."""
import logging
from telegram import InlineKeyboardButton as B, InlineKeyboardMarkup as K, ReplyKeyboardRemove
from telegram.error import BadRequest
from telegram.ext import CommandHandler, CallbackQueryHandler, MessageHandler, ApplicationHandlerStop, filters
import scent_picker

PAGE = 5
DELIVERY = '📦 Получение заказа\n\n• Подготовка — в течение 1–2 дней. Это не срок доставки.\n• Самовывоз в Перми: место и время по договорённости.\n• Отправка из Перми в регионы через Яндекс или Ozon.\n• Доставка за счёт покупателя, отдельно от стоимости парфюма.\n• Способ и стоимость доставки согласуем при оформлении.\n\n@kodenn88'
BUY = '🛒 Как купить\n\n1. Выберите аромат и объём в каталоге.\n2. Нажмите кнопку 5 мл или 10 мл.\n3. В открывшемся личном чате отправьте подготовленное сообщение продавцу и укажите свой город.\n\nНажатие кнопки ещё не оформляет заказ. Наличие, итоговую сумму, оплату и получение согласуем лично. Оплата внутри бота не подключена.\nАтомайзер включён в цену.\n\n@kodenn88'


def data():
    import main
    return main


def button(text, action):
    return B(text, callback_data='gc:' + action)


async def private_row(context):
    bot = await context.bot.get_me()
    return [B('Открыть в личном чате', url=f'https://t.me/{bot.username}?start=catalog')]


async def render(context, action):
    m = data()
    footer = [[button('⬅️ Меню группы', 'home')], await private_row(context)]
    if action == 'home':
        return ('💎 Нота 59 — каталог и заказы\n\nВыберите раздел. Меню общее для группы: переключение видно всем участникам.', K([[button('🌸 Каталог', 'list:-1:0'), button('✨ Подобрать аромат', 'pick')], [button('🛒 Как купить', 'buy'), button('📦 Получение', 'delivery')], [B('💬 Написать продавцу', url='https://t.me/kodenn88')], await private_row(context)]))
    if action == 'buy':
        return BUY, K(footer)
    if action == 'delivery':
        return DELIVERY, K(footer)
    if action == 'rules':
        return m.SECTIONS['📜 Правила'], K(footer)
    if action == 'contact':
        return '💬 Выбор аромата и оформление заказа: @kodenn88', K([[B('Написать продавцу', url='https://t.me/kodenn88')]] + footer)
    labels = list(scent_picker.CATEGORIES)
    if action == 'pick':
        rows = [[button(label, f'list:{i}:0') for i, label in enumerate(labels)][j:j+2] for j in range(0, len(labels), 2)]
        return '✨ Какой аромат ищете?\n\nКатегории могут пересекаться. Подбор условный: ориентируйтесь на свой вкус и условия использования.', K(rows + footer)
    parts = action.split(':')
    if parts[0] == 'list' and len(parts) == 3:
        cat, page = int(parts[1]), int(parts[2])
        if not -1 <= cat < len(labels):
            raise ValueError('Unknown category')
        names = list(m.PERFUMES) if cat == -1 else [n for n in scent_picker.CATEGORIES[labels[cat]] if n in m.PERFUMES]
        pages = max(1, (len(names) + PAGE - 1) // PAGE)
        page = max(0, min(page, pages - 1))
        all_names = list(m.PERFUMES)
        rows = [[button(n, f'card:{all_names.index(n)}:{cat}:{page}')] for n in names[page*PAGE:(page+1)*PAGE]]
        nav = ([button('◀️', f'list:{cat}:{page-1}')] if page else []) + ([button('▶️', f'list:{cat}:{page+1}')] if page+1 < pages else [])
        if nav:
            rows.append(nav)
        rows.append([button('✨ Подобрать аромат', 'pick')])
        title = '🌸 Каталог' if cat == -1 else labels[cat]
        return f'{title}\n\nАроматов: {len(names)}. Страница {page+1} из {pages}.\nВыберите аромат:', K(rows + footer)
    if parts[0] == 'card' and len(parts) == 4:
        index, cat, page = map(int, parts[1:])
        names = list(m.PERFUMES)
        if not 0 <= index < len(names) or not -1 <= cat < len(labels) or page < 0:
            raise ValueError('Invalid card')
        name = names[index]
        p = m.PERFUMES[name]
        text = f'💎 {name}\n\n📖 ОПИСАНИЕ\n{p["description"]}\n\n🌿 ПИРАМИДА / НОТЫ ПО FRAGRANTICA\n{p["notes"]}\n\n💰 ОБЪЁМЫ И ЦЕНЫ\n5 мл — {m.money(p["price5"])}\n10 мл — {m.money(p["price10"])}\n\nАтомайзер включён. Нажмите объём и отправьте сообщение продавцу. До оплаты уточните наличие и получение.\n@kodenn88'
        rows = [list(row) for row in m.order_buttons(name, p).inline_keyboard]
        return text, K(rows + [[button('⬅️ К списку', f'list:{cat}:{page}')]] + footer)
    raise ValueError('Unknown action')


async def open_menu(update, context, action='home'):
    if update.effective_chat is None or update.effective_chat.id != data().PROTECTED_GROUP_ID:
        return
    await update.effective_message.reply_text('Открываю меню «Нота 59».', reply_markup=ReplyKeyboardRemove())
    text, markup = await render(context, action)
    await update.effective_message.reply_text(text, reply_markup=markup)
    raise ApplicationHandlerStop


async def command(update, context):
    await open_menu(update, context)


async def text_menu(update, context):
    text = scent_picker.normalize_choice(update.effective_message.text or '')
    actions = {'каталог': 'list:-1:0', 'как купить': 'buy', 'связаться': 'contact', 'правила': 'rules', 'подобрать аромат': 'pick', 'главное меню': 'home', 'в каталог': 'list:-1:0'}
    action = actions.get(text)
    if action is not None:
        await open_menu(update, context, action)


async def callback(update, context):
    q = update.callback_query
    if q is None or q.message is None:
        return
    if q.message.chat.id != data().PROTECTED_GROUP_ID:
        await q.answer('Меню доступно только в группе «Нота 59».')
        return
    await q.answer()
    try:
        text, markup = await render(context, q.data[3:])
        await q.edit_message_text(text, reply_markup=markup)
    except (ValueError, IndexError):
        await q.message.reply_text('Меню устарело. Откройте /catalog заново.')
    except BadRequest as exc:
        if 'message is not modified' not in str(exc).lower():
            logging.exception('Group catalogue edit failed')
            await q.message.reply_text('Не удалось обновить меню. Откройте /catalog заново.')
    raise ApplicationHandlerStop


def register(application):
    scope = filters.Chat(data().PROTECTED_GROUP_ID) & filters.ChatType.GROUPS
    application.add_handler(CommandHandler(['catalog', 'menu', 'start'], command, filters=scope), group=-3)
    application.add_handler(MessageHandler(scope & filters.TEXT & ~filters.COMMAND, text_menu), group=-3)
    application.add_handler(CallbackQueryHandler(callback, pattern=r'^gc:'), group=-3)

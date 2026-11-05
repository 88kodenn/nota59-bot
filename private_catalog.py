"""Compact private catalogue; group navigation is unchanged."""
import logging
from pathlib import Path
from secrets import token_hex
from telegram import InlineKeyboardButton as B, InlineKeyboardMarkup as K, ReplyKeyboardRemove
from telegram.error import BadRequest, TelegramError
from telegram.ext import CallbackQueryHandler, CommandHandler, MessageHandler, ApplicationHandlerStop, filters
import scent_picker

PAGE = 5


def data():
    import main
    return main


def button(text, action):
    return B(text, callback_data='pc:' + action)


def home_rows():
    return [[button('Все ароматы', 'all'), button('Бренды', 'brands')], [button('Найти аромат', 'search'), button('Подобрать аромат', 'pick')], [button('Как купить', 'buy'), button('Правила', 'rules')], [B('Написать продавцу', url='https://t.me/kodenn88')]]


def selection(context, names, title):
    store = context.user_data.setdefault('_pc_lists', {})
    while len(store) >= 32:
        store.pop(next(iter(store)))
    key = token_hex(4)
    store[key] = (tuple(names), title)
    return list_view(context, key, 0)


def list_view(context, key, page):
    names, title = context.user_data.get('_pc_lists', {})[key]
    pages = max(1, (len(names) + PAGE - 1) // PAGE)
    page = max(0, min(page, pages - 1))
    indexes = {name: i for i, name in enumerate(data().PERFUMES)}
    rows = [[button(name, f'card:{indexes[name]}:{key}:{page}')] for name in names[page*PAGE:(page+1)*PAGE]]
    nav = []
    if page:
        nav.append(button('Назад', f'list:{key}:{page-1}'))
    if page + 1 < pages:
        nav.append(button('Далее', f'list:{key}:{page+1}'))
    if nav:
        rows.append(nav)
    rows += [[button('Поиск', 'search'), button('Меню каталога', 'home')]]
    text = f'{title}\n\nНайдено: {len(names)}. Страница {page+1} из {pages}.\nВыберите аромат:' if names else 'Ничего не найдено. Попробуйте другое название или часть названия.'
    return text, K(rows)


def card_view(context, index, key, page):
    m = data()
    name = list(m.PERFUMES)[index]
    if index < 0 or name not in context.user_data.get('_pc_lists', {})[key][0]:
        raise ValueError('Invalid card')
    p = m.PERFUMES[name]
    text = f'💎 {name}\n\n📖 ОПИСАНИЕ\n{p["description"]}\n\n🌿 ПИРАМИДА / НОТЫ ПО FRAGRANTICA\n{p["notes"]}\n\n💰 ОБЪЁМЫ И ЦЕНЫ\n• 5 мл (около 70 распылений) — {m.money(p["price5"])}\n• 10 мл (около 140 распылений) — {m.money(p["price10"])}\n\nАтомайзер включён в стоимость.\nНажмите объём и отправьте подготовленное сообщение продавцу. До оплаты уточните наличие и получение.\n@kodenn88'
    rows = [list(row) for row in m.order_buttons(name, p).inline_keyboard]
    if p.get('photo'):
        rows.append([button('Фото флакона', f'photo:{index}:{key}:{page}')])
    rows.append([button('К списку', f'list:{key}:{page}')])
    return text, K(rows)


def render(context, action):
    m = data()
    if action != 'search':
        context.user_data.pop('_pc_search', None)
    if action == 'home':
        return f'💎 Каталог «Нота 59»\n\nАроматов: {len(m.PERFUMES)}. Объёмы: 5 и 10 мл.\nВыберите раздел или напишите название аромата.', K(home_rows())
    if action == 'all':
        return selection(context, list(m.PERFUMES), 'Все ароматы')
    if action == 'brands':
        buttons = [button(brand, f'brand:{i}') for i, brand in enumerate(m.BRANDS)]
        return 'Выберите бренд:', K([buttons[i:i+2] for i in range(0, len(buttons), 2)] + [[button('Меню каталога', 'home')]])
    if action == 'pick':
        buttons = [button(label, f'category:{i}') for i, label in enumerate(scent_picker.CATEGORIES)]
        return 'Какой аромат ищете?\nПодбор условный: ориентируйтесь на свой вкус.', K([buttons[i:i+2] for i in range(0, len(buttons), 2)] + [[button('Меню каталога', 'home')]])
    if action == 'search':
        context.user_data['_pc_search'] = True
        return 'Напишите название аромата или его часть на русском или латинице.\nНапример: авентус, интерлюд или Tom Ford.', K([[button('Отмена', 'home')]])
    if action in ('buy', 'rules', 'contact'):
        section = {'buy': '🛒 Как купить', 'rules': '📜 Правила', 'contact': '💬 Связаться'}[action]
        return m.SECTIONS[section], K([[button('Меню каталога', 'home')]])
    parts = action.split(':')
    if parts[0] == 'brand' and len(parts) == 2:
        index = int(parts[1])
        if not 0 <= index < len(m.BRANDS):
            raise ValueError('Invalid brand')
        brand = m.BRANDS[index]
        return selection(context, [n for n in m.PERFUMES if m.BRAND_OF[n] == brand], brand)
    if parts[0] == 'category' and len(parts) == 2:
        index = int(parts[1])
        labels = list(scent_picker.CATEGORIES)
        if not 0 <= index < len(labels):
            raise ValueError('Invalid category')
        label = labels[index]
        return selection(context, [n for n in scent_picker.CATEGORIES[label] if n in m.PERFUMES], label)
    if parts[0] == 'list' and len(parts) == 3:
        return list_view(context, parts[1], int(parts[2]))
    if parts[0] == 'card' and len(parts) == 4:
        return card_view(context, int(parts[1]), parts[2], int(parts[3]))
    raise ValueError('Unknown action')


async def hide_keyboard(message, context, force=False):
    if force or not context.user_data.get('_pc_keyboard_removed'):
        await message.reply_text('Каталог теперь управляется кнопками под сообщениями.', reply_markup=ReplyKeyboardRemove())
        context.user_data['_pc_keyboard_removed'] = True


async def command(update, context):
    if update.effective_chat is None or update.effective_chat.type != 'private':
        return
    context.user_data.pop('_pc_search', None)
    await hide_keyboard(update.effective_message, context, force=True)
    text, markup = render(context, 'home')
    await update.effective_message.reply_text(text, reply_markup=markup)
    raise ApplicationHandlerStop


async def text_input(update, context):
    message = update.effective_message
    if message is None:
        return
    m = data()
    text = (message.text or '').strip()
    choice = scent_picker.normalize_choice(text)
    actions = {'каталог': 'home', 'в каталог': 'home', 'главное меню': 'home', 'все ароматы': 'all', 'выбрать бренд': 'brands', 'найти аромат': 'search', 'подобрать аромат': 'pick', 'как купить': 'buy', 'правила': 'rules', 'связаться': 'contact'}
    action = actions.get(choice)
    await hide_keyboard(message, context)
    if action:
        body, markup = render(context, action)
    elif choice in scent_picker.CATEGORY_LOOKUP and not context.user_data.get('_pc_search'):
        label = scent_picker.CATEGORY_LOOKUP[choice]
        body, markup = render(context, f'category:{list(scent_picker.CATEGORIES).index(label)}')
    elif text in m.BRANDS and not context.user_data.get('_pc_search'):
        body, markup = render(context, f'brand:{m.BRANDS.index(text)}')
    else:
        context.user_data.pop('_pc_search', None)
        name = m.ALIASES.get(text, text)
        if name in m.PERFUMES:
            selection(context, [name], 'Результаты поиска')
            key = next(reversed(context.user_data['_pc_lists']))
            body, markup = card_view(context, list(m.PERFUMES).index(name), key, 0)
        else:
            body, markup = selection(context, m.find_perfumes(text), 'Результаты поиска')
    await message.reply_text(body, reply_markup=markup)
    raise ApplicationHandlerStop


async def callback(update, context):
    q = update.callback_query
    if q is None or q.message is None:
        return
    if q.message.chat.type != 'private':
        await q.answer('Эта кнопка предназначена для личного каталога.')
        raise ApplicationHandlerStop
    await q.answer()
    action = q.data[3:]
    try:
        if action.startswith('photo:'):
            _, index, key, page = action.split(':')
            index = int(index)
            card_view(context, index, key, int(page))
            m = data()
            name = list(m.PERFUMES)[index]
            filename = m.PERFUMES[name].get('photo')
            if not filename:
                raise ValueError('No photo')
            root = Path(m.BASE_DIR).resolve()
            path = (root / filename).resolve()
            if path.parent != root or not path.is_file():
                await q.message.reply_text('Фото пока недоступно.')
            else:
                with path.open('rb') as image:
                    await q.message.reply_photo(image, caption=name)
            raise ApplicationHandlerStop
        text, markup = render(context, action)
    except (KeyError, ValueError, IndexError):
        text, markup = render(context, 'home')
        text = 'Меню устарело. Выберите раздел заново.\n\n' + text
    try:
        await q.edit_message_text(text, reply_markup=markup)
    except BadRequest as exc:
        if 'message is not modified' not in str(exc).lower():
            await q.message.reply_text(text, reply_markup=markup)
    except TelegramError:
        logging.exception('Private catalogue update failed')
        await q.message.reply_text('Не удалось обновить меню. Отправьте /catalog.')
    raise ApplicationHandlerStop


def register(application):
    application.add_handler(CommandHandler(['start', 'catalog', 'menu'], command, filters=filters.ChatType.PRIVATE), group=-5)
    application.add_handler(MessageHandler(filters.ChatType.PRIVATE & filters.TEXT & ~filters.COMMAND, text_input), group=-5)
    application.add_handler(CallbackQueryHandler(callback, pattern=r'^pc:'), group=-5)

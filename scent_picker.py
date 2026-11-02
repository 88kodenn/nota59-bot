"""Curated catalogue selections; occasion labels are shop recommendations."""
import re
import unicodedata
from telegram import ReplyKeyboardMarkup
from telegram.ext import MessageHandler, CommandHandler, ApplicationHandlerStop, filters

PICK = '✨ Подобрать аромат'
CATEGORIES = {
    'Свежий 🌿': ('Creed Aventus', 'Essential Parfums Bois Imperial', 'Louis Vuitton Pacific Chill', 'Tom Ford Grey Vetiver EDP'),
    'Сладкий 🍮': ('Clive Christian Jump Up And Kiss Me Hedonistic (2021)', 'Ex Nihilo Blue Talisman', 'Jean Paul Gaultier Le Male Le Parfum', 'Jean Paul Gaultier Le Male Elixir', 'Kilian Angels Share', 'Maison Crivelli Oud Maracuja', 'Parfums de Marly Althair', 'Parfums de Marly Herod', 'Tom Ford Noir Extreme EDP', 'Tom Ford Soleil Blanc EDP'),
    'Древесный 🪵': ('Amouage Interlude Man', 'Amouage Interlude Black Iris Man', 'Clive Christian Jump Up And Kiss Me Hedonistic (2021)', 'Creed Aventus', 'Creed Absolu Aventus 2025', 'Essential Parfums Bois Imperial', 'Ex Nihilo Blue Talisman', 'Ex Nihilo The Hedonist', 'Ex Nihilo The Hedonist Extrait', 'Maison Crivelli Oud Maracuja', 'Parfums de Marly Herod', 'Tom Ford Grey Vetiver EDP', 'Viktor & Rolf Spicebomb'),
    'Дымный 🔥': ('Amouage Interlude Man', 'Amouage Interlude Black Iris Man'),
    'Гурманский 🧁': ('Parfums de Marly Althair', 'Kilian Angels Share', 'Jean Paul Gaultier Le Male Elixir', 'Tom Ford Noir Extreme EDP'),
    'Пряный 🌶': ('Viktor & Rolf Spicebomb', 'Creed Absolu Aventus 2025', 'Jean Paul Gaultier Le Male Le Parfum', 'Kilian Angels Share', 'Parfums de Marly Herod', 'Tom Ford Noir Extreme EDP'),
    'На каждый день': ('Creed Aventus', 'Creed Absolu Aventus 2025', 'Essential Parfums Bois Imperial', 'Ex Nihilo Blue Talisman', 'Ex Nihilo The Hedonist', 'Louis Vuitton Pacific Chill', 'Tom Ford Grey Vetiver EDP', 'Tom Ford Soleil Blanc EDP'),
    'На вечер': ('Amouage Interlude Man', 'Amouage Interlude Black Iris Man', 'Clive Christian Jump Up And Kiss Me Hedonistic (2021)', 'Creed Absolu Aventus 2025', 'Ex Nihilo The Hedonist Extrait', 'Jean Paul Gaultier Le Male Le Parfum', 'Jean Paul Gaultier Le Male Elixir', 'Kilian Angels Share', 'Maison Crivelli Oud Maracuja', 'Parfums de Marly Althair', 'Parfums de Marly Herod', 'Tom Ford Noir Extreme EDP', 'Viktor & Rolf Spicebomb'),
}
PAGE_SIZE = 5
PREV, NEXT = '◀️ Предыдущие', 'Следующие ▶️'


def normalize_choice(text):
    text = unicodedata.normalize('NFKC', text).casefold().replace('ё', 'е')
    return ' '.join(re.findall(r'[^\W_]+', text, flags=re.UNICODE))


CATEGORY_LOOKUP = {normalize_choice(label): label for label in CATEGORIES}


def category_rows():
    return [['Свежий 🌿', 'Сладкий 🍮'], ['Древесный 🪵', 'Дымный 🔥'], ['Гурманский 🧁', 'Пряный 🌶'], ['На каждый день', 'На вечер']]


def home_menu():
    return ReplyKeyboardMarkup([['🫙 Каталог', PICK]] + category_rows() + [['🛒 Как купить', '💬 Связаться'], ['📜 Правила']], resize_keyboard=True)


def catalog_menu():
    return ReplyKeyboardMarkup([['🔎 Найти аромат', '🏷 Выбрать бренд'], [PICK], ['📋 Все ароматы'], ['⬅️ Главное меню']], resize_keyboard=True)


def picker_menu():
    return ReplyKeyboardMarkup(category_rows() + [['⬅️ В каталог'], ['⬅️ Главное меню']], resize_keyboard=True)


def catalogue():
    import main
    return main


async def open_home(update, context):
    m = update.effective_message
    if m is None:
        return
    context.user_data.clear()
    await m.reply_text('Добро пожаловать в «Нота 59»! 🫙\n\nПарфюмерия на распив.\n\nОткройте каталог или выберите характер аромата и повод прямо на главном экране.', reply_markup=home_menu())
    raise ApplicationHandlerStop


async def open_catalog(update, context):
    m = update.effective_message
    if m is None:
        return
    context.user_data.clear()
    await m.reply_text(f'🫙 Каталог «Нота 59»\n\n✨ Ароматов: {len(catalogue().PERFUMES)}\n📦 Объёмы 5 и 10 мл. Атомайзер включён.\n\nНайдите аромат по названию, бренду или воспользуйтесь подбором.', reply_markup=catalog_menu())
    raise ApplicationHandlerStop


async def open_start_catalog(update, context):
    if context.args and context.args[0] == 'catalog':
        await open_catalog(update, context)
    else:
        await open_home(update, context)


async def show_selection(message, context, category, page=0):
    names = [name for name in CATEGORIES[category] if name in catalogue().PERFUMES]
    pages = max(1, (len(names) + PAGE_SIZE - 1) // PAGE_SIZE)
    page = max(0, min(page, pages - 1))
    context.user_data['picker_category'] = category
    context.user_data['picker_page'] = page
    rows = [[name] for name in names[page * PAGE_SIZE:(page + 1) * PAGE_SIZE]]
    nav = ([PREV] if page else []) + ([NEXT] if page + 1 < pages else [])
    if nav:
        rows.append(nav)
    rows += [[PICK], ['⬅️ В каталог'], ['⬅️ Главное меню']]
    text = f'{category}\n\nНайдено: {len(names)}. Страница {page + 1} из {pages}.\nВыберите аромат, чтобы открыть описание, ноты, объёмы и цены.' if names else f'{category}\n\nВ этой категории пока нет ароматов.'
    await message.reply_text(text, reply_markup=ReplyKeyboardMarkup(rows, resize_keyboard=True))


async def handle_picker(update, context):
    m = update.effective_message
    if m is None:
        return
    text = (m.text or '').strip()
    choice = normalize_choice(text)
    if choice == normalize_choice('⬅️ Главное меню'):
        await open_home(update, context)
    if choice in (normalize_choice('🫙 Каталог'), normalize_choice('⬅️ В каталог')):
        await open_catalog(update, context)
    if choice == normalize_choice(PICK):
        context.user_data.pop('picker_category', None)
        context.user_data.pop('picker_page', None)
        await m.reply_text('✨ Какой аромат ищете?\n\nПо характеру: свежий, сладкий, древесный, дымный, гурманский или пряный.\nПо поводу: на каждый день или на вечер.\n\nНажмите кнопку ниже или напишите категорию — например, «Свежий» или «Гурманский».\n\nКатегории могут пересекаться. Подбор условный: ориентируйтесь на свой вкус и условия использования.', reply_markup=picker_menu())
        raise ApplicationHandlerStop
    selected = CATEGORY_LOOKUP.get(choice)
    if selected is not None:
        await show_selection(m, context, selected)
        raise ApplicationHandlerStop
    category = context.user_data.get('picker_category')
    if category in CATEGORIES and choice in (normalize_choice(PREV), normalize_choice(NEXT)):
        page = context.user_data.get('picker_page', 0) + (1 if choice == normalize_choice(NEXT) else -1)
        await show_selection(m, context, category, page)
        raise ApplicationHandlerStop
    if text in ('🛒 Как купить', '💬 Связаться', '📜 Правила'):
        context.user_data.pop('picker_category', None)
        context.user_data.pop('picker_page', None)
        await m.reply_text(catalogue().SECTIONS[text], reply_markup=home_menu())
        raise ApplicationHandlerStop
    if category and text not in catalogue().PERFUMES and text not in catalogue().ALIASES:
        context.user_data.pop('picker_category', None)
        context.user_data.pop('picker_page', None)


def register(application):
    application.add_handler(CommandHandler('catalog', open_catalog, filters=filters.ChatType.PRIVATE), group=-2)
    application.add_handler(CommandHandler('start', open_start_catalog, filters=filters.ChatType.PRIVATE), group=-2)
    application.add_handler(MessageHandler(filters.ChatType.PRIVATE & filters.TEXT & ~filters.COMMAND, handle_picker), group=-2)

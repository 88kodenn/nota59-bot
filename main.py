import logging
import os
import re
import time
import unicodedata
from urllib.parse import quote, urlsplit
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, MessageEntity
from telegram.error import TelegramError
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ApplicationHandlerStop, ChatMemberHandler
import report
import security_log as slog

logging.basicConfig(format='%(asctime)s %(levelname)s %(name)s: %(message)s', level=logging.INFO)
logging.getLogger('httpx').setLevel(logging.WARNING)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SELLER = 'kodenn88'
CATALOG = [
    ('Amouage Interlude Man', 1350, 2700,
     'Есть ароматы для знакомства, а есть — для появления. Пряный травяной старт здесь словно приоткрывает дверь в помещение, где тлеют благовония. Орегано и перец встречаются с густым ладаном, тёплыми смолами и амбровой глубиной. Затем композиция темнеет: древесина, кожа и уд создают плотную фактуру. Ассоциации — вечер у камина в старом доме, дым благовоний, кожаное кресло и тёмный бархат. Это аромат-заявление: не про тихий уют, а про харизму и готовность быть услышанным.\n\nВ СТОРОНУ: мужская — по статистике Fragrantica аромат чаще выбирают мужчины.',
     'Верх: орегано, перец, бергамот.\nСердце: ладан, опопонакс, амбра, лабданум.\nБаза: уд, кожа, сандал, пачули.', None),
    ('Amouage Interlude Black Iris Man', 1350, 2700,
     'Если Interlude Man — выразительный голос в большом зале, то Black Iris — тот же разговор, но тише и ближе. Зелень фиалкового листа и розмарин открывают композицию прохладно. Ирис добавляет пудровую, землистую мягкость, а смолы, ваниль и сандал создают бархатистое тепло. Кожано-удовая основа сохраняет тёмный характер. Ассоциации — бархатный пиджак, прохладный вечер, ирис в тёмной вазе и кожаные перчатки. Это вариант для тех, кто любит глубину, но предпочитает звучание более собранное и элегантное.\n\nВ СТОРОНУ: мужская — древесно-кожаная основа и характер композиции читаются как мужские.',
     'Верх: лист фиалки, розмарин, бергамот.\nСердце: корень ириса, олибанум, мирра, амбра, лабданум, ваниль.\nБаза: кожа, уд, сандал, пачули, кедр.', None),
    ('Clive Christian Jump Up And Kiss Me Hedonistic (2021)', 3000, 6000,
     'Удовольствие здесь показано через контрасты: чёрная вишня встречается с зеленью мате, цитрусами и фиалковым листом. Затем история переходит в табачно-древесную сторону: ирис добавляет мягкость, папирус — сухую фактуру, кожа и лабданум затемняют фон. Ваниль и бобы тонка работают как тёплый свет. Ассоциации — бокал вишнёвого ликёра, полированное дерево, табачный дым в дальнем углу бара и бархатная обивка. Это глубокий, взрослый аромат для вечера, когда хочется звучать дорого и немного загадочно.\n\nВ СТОРОНУ: унисекс с заметным мужским уклоном — по отзывам Fragrantica его чаще выбирают мужчины.',
     'Верх: чёрная вишня, лист фиалки, мате, нероли, бергамот, мускатный шалфей, мандарин, грейпфрут, лимон.\nСердце: табак, корень ириса, папирус, жасмин.\nБаза: амбра, кожа, бобы тонка, ваниль, мускус, сандал, кашемировое дерево, лабданум, ветивер, пачули, мох.', None),
    ('Creed Aventus', 1400, 2800,
     'Aventus интересен контрастом между светом и тенью. Сначала — цитрусы, яблоко и смородина, затем ананасовый акцент, придающий сочность. Но это не фруктовый коктейль: под свежестью постепенно обозначаются сухая древесина, пачули и берёзовая грань. Мускус и мох собирают всё в сдержанный образ. Ассоциации — дорогое дерево, кожаные перчатки, утренний город и уверенный шаг. Это аромат про собранность и амбиции, а не про отдых на пляже.\n\nВ СТОРОНУ: мужская — один из самых узнаваемых мужских ароматов по статистике Fragrantica.',
     'Верх: бергамот, чёрная смородина, яблоко, лимон, розовый перец.\nСердце: ананас, пачули, марокканский жасмин.\nБаза: берёза, мускус, дубовый мох, кедр, Ambroxan.', 'aventus.jpg'),
    ('Creed Absolu Aventus 2025', 1900, 3800,
     'Знакомая фруктово-древесная идея получает пряную рамку. Ананас и смородина соседствуют с терпким грейпфрутом, розовый перец добавляет искристость. В сердце имбирь, кардамон и корица переводят свежесть в тёплое звучание. Ветивер и пачули дают сухое завершение. Ассоциации — свежесть дорогого отеля, цитрусовая цедра, костюм без галстука и уверенный вечер. Это более пряная и нарядная версия знакомой истории.\n\nВ СТОРОНУ: мужская — аромат позиционируется и воспринимается как мужской.',
     'Верх: ананас, чёрная смородина, яблоко, лимон, розовый перец.\nСердце: кардамон, имбирь.\nБаза: ветивер, пачули.', None),
    ('Essential Parfums Bois Imperial', 500, 1000,
     'Древесина без тяжёлой резной рамы: много воздуха, зелени и чётких линий. Базилик напоминает свежерастёртые листья, перец тимут добавляет пряную искру, ветивер поддерживает сухую сторону. Akigalawood и Ambroxan формируют современную древесную конструкцию — скорее архитектуру из дерева и стекла, чем лесную открытку. Ассоциации — минимализм, базилик на подоконнике, стекло и бетон после дождя. Это аромат для тех, кто любит чистые линии и не хочет пахнуть сладко.\n\nВ СТОРОНУ: унисекс — звучит одинаково естественно и на мужчинах, и на женщинах.',
     'Ноты композиции, без деления на уровни: Akigalawood, древесные ноты, базилик, ветивер, перец тимут, Ambroxan, пачули.', None),
    ('Ex Nihilo Blue Talisman', 1950, 3900,
     'Сочная груша в прозрачном древесно-мускусном свете. Бергамот и мандарин добавляют яркость, имбирь не даёт фруктовому началу стать слишком мягким. Цветок апельсина раскрывает цветочную сторону, а древесные материалы удерживают композицию в современном ключе. Ассоциации — груша со льдом, белая рубашка, морской бриз и лёгкость дорогого отеля. Это свежий, чистый и универсальный аромат на каждый день.\n\nВ СТОРОНУ: унисекс — свежесть и мускус делают его одинаково уместным для мужчин и женщин.',
     'Верх: груша, бергамот, мандарин, имбирь.\nСердце: цветок апельсина, Джордживуд.\nБаза: мускус, Амброфикс, Akigalawood, кедр.', None),
    ('Ex Nihilo The Hedonist', 1300, 2600,
     'Прогулка по деревянной террасе прохладным утром. Бергамот и имбирь задают бодрый пряно-цитрусовый тон, но дальше главным становится дерево. Кедр даёт сухую структуру, Akigalawood — пряную выразительность, ветивер добавляет глубину. Бобы тонка и мускус смягчают края. Ассоциации — утренний свет, лёгкая небритость, кедровая терраса и свежесть после душа. Это спокойный, дорогой и собранный аромат.\n\nВ СТОРОНУ: мужская — древесная основа и характер композиции читаются как мужские.',
     'Верх: груша, бергамот, мандарин, имбирь.\nСердце: цветок апельсина, Джордживуд.\nБаза: мускус, Амброфикс, Akigalawood, кедр.', None),
    ('Ex Nihilo The Hedonist Extrait', 1450, 2900,
     'Древесная история становится более фактурной. Грейпфрут добавляет горчинку, имбирь — пряность, личи приносит фруктовый нюанс в контраст к кедру. В основе — древесно-амбровое направление, ветивер и пачули, смягчённые бобами тонка. Ассоциации — личи со льдом, тёмное дерево, вечерний бар и мягкий свет ламп. Это более насыщенная и вечерняя версия Hedonist.\n\nВ СТОРОНУ: мужская — глубокая древесно-амбровая база читается как мужская.',
     'Верх: груша, бергамот, мандарин, имбирь.\nСердце: цветок апельсина, Джордживуд.\nБаза: мускус, Амброфикс, Akigalawood, кедр.', None),
    ('Jean Paul Gaultier Le Male Le Parfum', 700, 1400,
     'Кардамон задаёт пряное вступление, после которого композиция словно меняет освещение: лаванда и ирис создают мягкую припудренную середину. Ванильная древесная база добавляет тепла. Представьте тёмную ткань, мягкий воротник и приглушенный свет. Ассоциации — вечерний город, мягкий шарф, пудра и тепло кожи. Это аромат про спокойную привлекательность, а не про напор.\n\nВ СТОРОНУ: мужская — классическое мужское звучание с мягкой, обволакивающей базой.',
     'Верх: кардамон.\nСердце: лаванда, ирис.\nБаза: ваниль, восточные ноты, древесные ноты.', None),
    ('Jean Paul Gaultier Le Male Elixir', 700, 1400,
     'Контраст прохладного начала и тёплого сладкого продолжения. Лаванда и мята дают зелёную свежесть, вскоре на первый план выходят ваниль, бензоин и медовая сторона. Табак и бобы тонка добавляют глубину. Ассоциации — мёд, табачный дым, тёплый свитер и поздний вечер. Это аромат про магнетизм и мягкую силу, а не про лёгкость.\n\nВ СТОРОНУ: мужская — сладкая табачно-ванильная база читается как мужская.',
     'Верх: лаванда, мята.\nСердце: ваниль, бензоин.\nБаза: мёд, бобы тонка, табак.', None),
    ('Kilian Angels Share', 1500, 3000,
     'Тёплое дерево, пряности и бокал коньяка рядом с десертом. Коньячный аккорд задаёт настроение, корица добавляет тепло, дуб удерживает композицию от превращения в чистую кондитерскую сладость. Ваниль и пралине создают уютную гурманскую основу. Ассоциации — яблочный пирог, камин, бархатная обивка и бокал коньяка. Это аромат-десерт для тех, кто любит тепло, вкус и мягкий шлейф.\n\nВ СТОРОНУ: унисекс с уклоном в женскую сторону — тёплая гурманская ваниль, пралине и коньячный аккорд чаще выбираются женщинами.',
     'Верх: коньяк.\nСердце: корица, бобы тонка, дуб, Гедион.\nБаза: ваниль, пралине, сандал, засахаренный миндаль.', None),
    ('Louis Vuitton Pacific Chill', 1800, 3600,
     'Есть ароматы, которые пытаются произвести впечатление, а есть те, с которыми просто хорошо. Pacific Chill — про второе. Представьте неспешное утро в отпуске и холодный фруктовый коктейль с растёртой между пальцами мятой. Цитрусы, смородиновая кислинка и базилик встречаются с мягким абрикосовым акцентом. Затем звучание становится спокойнее, проявляется инжирный оттенок. Ассоциации — лёгкая рубашка, отпуск, мята, абрикос и утренний бриз. Это история про удовольствие от простых вещей.\n\nВ СТОРОНУ: унисекс с уклоном в женскую сторону — мягкая фруктово-цитрусовая свежесть с мятой и абрикосом чаще выбирается женщинами.',
     'Верх: апельсин, цитрон, лимон, мята, чёрная смородина, кориандр.\nСердце: абрикос, базилик, майская роза, семена моркови.\nБаза: инжир, финики, амбретта.', 'pacific_chill.jpeg'),
    ('Maison Crivelli Oud Maracuja', 2000, 4000,
     'Тропическая фруктовость встречается с тёмной древесно-кожаной стороной. Маракуйя даёт кисло-сладкий акцент, шафран и роза усложняют его, а уд меняет настроение. Под сочной поверхностью — кожа, пачули и смолы. Ваниль и бензоин сглаживают контраст, не убирая его. Ассоциации — маракуйя, шафран, экзотический вечер, кожа и тёмное дерево. Это аромат для тех, кто любит необычные сочетания и не боится внимания.\n\nВ СТОРОНУ: унисекс — фруктовость и уд создают баланс, который работает в обе стороны.',
     'Верх: маракуйя, фруктовые ноты, шафран, турецкая роза.\nСердце: уд, бензоин, индонезийские пачули.\nБаза: кожа, Akigalawood, амбра, ваниль, лабданум.', None),
    ('Parfums de Marly Althair', 1150, 2300,
     'Ваниль в окружении специй, древесины и света апельсинового цвета. Кардамон и корица делают начало тёплым, бергамот сохраняет контраст. В сердце раскрывается бурбонская ваниль со смолистым элеми. Пралине добавляет гурманскую сторону, гваяк и Ambroxan создают опору. Ассоциации — мягкий трикотаж, тёплый десерт, апельсиновая цедра и уютный вечер. Это аромат про мягкую уверенность и дорогое тепло.\n\nВ СТОРОНУ: мужская — аромат позиционируется как мужской и стал любимцем женской аудитории, но часто носится и женщинами.',
     'Верх: корица, цветок апельсина, кардамон, бергамот.\nСердце: бурбонская ваниль, элеми.\nБаза: пралине, мускус, Ambroxan, бобы тонка, гваяк, засахаренный миндаль.', None),
    ('Parfums de Marly Herod', 1500, 3000,
     'Табачная тема в мягком пряно-ванильном обрамлении. Корица задаёт тепло, табачный лист хочется представить как сухой ароматный материал рядом со специями и смолами, а не сигаретный дым. Ладан и лабданум добавляют глубину, османтус — тонкий оттенок, ваниль смягчает древесную основу. Ассоциации — тёмное дерево, вечер, сухой табак и мягкий свет. Это аромат про спокойную уверенность и вечернюю харизму.\n\nВ СТОРОНУ: мужская — табачно-древесная основа и характер композиции читаются как мужские.',
     'Основные ноты пирамиды — список базы сокращён.\nВерх: корица, пеппервуд.\nСердце: лист табака, ладан, османтус, лабданум.\nБаза: ваниль, Iso E Super, мускус, кедр, нагармота, ветивер.', None),
    ('Tom Ford Grey Vetiver EDP', 900, 1800,
     'Чёткие линии и сухая древесная элегантность. Грейпфрут даёт терпкую свежесть, шалфей — травяной акцент, пряности и корень ириса усложняют середину. Ветивер становится главным материалом, вокруг которого выстраиваются древесные и мшистые оттенки. Ассоциации — серый костюм, грейпфрут, шалфей и собранность. Это аромат для тех, кто предпочитает сдержанность выраженной сладости.\n\nВ СТОРОНУ: мужская — классическое мужское древесно-цитрусовое звучание.',
     'Верх: грейпфрут, цветок апельсина, шалфей.\nСердце: мускатный орех, корень ириса, красный перец.\nБаза: ветивер, древесные ноты, дубовый мох, амбра.', None),
    ('Tom Ford Noir Extreme EDP', 900, 1800,
     'Вечерняя пряность с кремовой, почти десертной серединой. Кардамон, мускатный орех и шафран открывают композицию, затем появляется аккорд кульфи — индийского замороженного молочного десерта. Цветы добавляют объём, ваниль и сандал делают завершение мягким. Ассоциации — бархат, вечерний ресторан, пряный десерт и приглушенный свет. Это аромат про мягкую роскошь и вечернее обаяние.\n\nВ СТОРОНУ: мужская — пряно-древесная база и характер композиции читаются как мужские.',
     'Верх: кардамон, мускатный орех, шафран, мандарин, нероли.\nСердце: кульфи, роза, мастиковое дерево, цветок апельсина, жасмин.\nБаза: ваниль, амбра, древесные ноты, сандал.', None),
    ('Tom Ford Soleil Blanc EDP', 1100, 2200,
     'Не столько запах моря, сколько образ кожи, согретой солнцем, белых цветов и кремового кокосового тепла. Фисташковый акцент и кардамон делают начало интереснее привычной тропической сладости. Тубероза, жасмин и иланг-иланг формируют цветочное сердце. Кокос, бензоин и бобы тонка создают мягкую основу. Ассоциации — отпуск, тёплый песок, белая ткань и кремовый кокос. Это аромат про солнце, кожу и расслабленную роскошь.\n\nВ СТОРОНУ: унисекс с уклоном в женскую сторону — цветочное сердце и кремовая база чаще выбираются женщинами.',
     'Верх: фисташки, бергамот, кардамон, розовый перец.\nСердце: тубероза, иланг-иланг, жасмин.\nБаза: кокос, бензоин, бобы тонка.', None),
    ('Viktor & Rolf Spicebomb', 500, 1000,
     'Специи, у которых есть и искра, и тёплое продолжение. Розовый перец и цитрусы создают яркий старт. Корица, шафран и паприка переводят композицию в горячую палитру, табак и кожа добавляют глубину, ветивер — сухую опору. Ассоциации — специи, кожа, плотная куртка и вечерний город. Это аромат про дерзость, тепло и уверенность.\n\nВ СТОРОНУ: мужская — пряно-табачная основа и характер композиции читаются как мужские.',
     'Верх: розовый перец, элеми, бергамот, грейпфрут.\nСердце: корица, шафран, паприка.\nБаза: табак, кожа, ветивер.', None),
]
PERFUMES = {name: dict(price5=p5, price10=p10, description=description, notes=notes, photo=photo) for name, p5, p10, description, notes, photo in CATALOG}
ALIASES = {'Tom Ford Grey Vetiver': 'Tom Ford Grey Vetiver EDP', 'Clive Christian Hedonistic': 'Clive Christian Jump Up And Kiss Me Hedonistic (2021)'}
BRAND_WORDS = {
    'Amouage': 'амуаж амуаж амуаже', 'Clive Christian': 'клайв кристиан',
    'Creed': 'крид', 'Essential Parfums': 'эссеншиал эссеншл парфюмс',
    'Ex Nihilo': 'экс нихило экснихило', 'Jean Paul Gaultier': 'жан поль готье готьер',
    'Kilian': 'килиан киллиан', 'Louis Vuitton': 'луи вуиттон виттон вьюттон',
    'Maison Crivelli': 'мезон кривелли', 'Parfums de Marly': 'парфюмс де марли',
    'Tom Ford': 'том форд', 'Viktor & Rolf': 'виктор рольф',
}
NAME_WORDS = [
    'интерлюд интерлюд мэн', 'интерлюд блэк айрис ирис', 'гедонист гедонистик хедонистик',
    'авентус', 'абсолю абсолют авентус', 'буа империал бойс империал',
    'блю талисман', 'гедонист хедонист', 'гедонист хедонист экстракт экстрат',
    'ле маль ле парфюм', 'ле маль эликсир', 'энджелс шер ангелс шейр доля ангелов',
    'пасифик пацифик чилл', 'уд маракуйя маракуя', 'альтаир алтаир', 'херод герод',
    'грей ветивер грэй', 'нуар экстрим', 'солей блан солей бланк', 'спайсбомб спайс бомб',
]
BRANDS = list(BRAND_WORDS)
NAMES = list(PERFUMES)
BRAND_OF = {name: next(brand for brand in BRANDS if name.startswith(brand + ' ')) for name in NAMES}
PAGE_SIZE = 5


def normalize(text):
    text = unicodedata.normalize('NFKD', text.casefold().replace('ё', 'е'))
    text = ''.join(c for c in text if not unicodedata.combining(c))
    return ' '.join(re.sub(r'[^\w\s]', ' ', text).split())


SEARCH_TEXT = {name: normalize(name + ' ' + BRAND_WORDS[BRAND_OF[name]] + ' ' + NAME_WORDS[i]) for i, name in enumerate(NAMES)}


def find_perfumes(query):
    words = normalize(query).split()
    if not words:
        return []
    return [name for name in NAMES if all(word in SEARCH_TEXT[name] for word in words)]


def money(value):
    return f'{value:,}'.replace(',', ' ') + ' ₽'


def main_menu():
    return ReplyKeyboardMarkup([['🌸 Каталог', '🛒 Как купить'], ['💬 Связаться', '📜 Правила']], resize_keyboard=True)


def catalog_menu():
    return ReplyKeyboardMarkup([['🔎 Найти аромат', '🏷 Выбрать бренд'], ['📋 Все ароматы'], ['⬅️ Главное меню']], resize_keyboard=True, input_field_placeholder='Можно написать название аромата')


def brand_menu():
    rows = [BRANDS[i:i+2] for i in range(0, len(BRANDS), 2)]
    return ReplyKeyboardMarkup(rows + [['🔎 Найти аромат'], ['⬅️ В каталог']], resize_keyboard=True)


async def show_results(message, context, names=None, title=None, page=0):
    if names is not None:
        context.user_data['results'] = list(names)
        context.user_data['results_title'] = title or 'Ароматы'
    names = context.user_data.get('results', [])
    pages = max(1, (len(names) + PAGE_SIZE - 1) // PAGE_SIZE)
    page = max(0, min(page, pages - 1))
    context.user_data['page'] = page
    rows = [[name] for name in names[page * PAGE_SIZE:(page + 1) * PAGE_SIZE]]
    nav = []
    if page:
        nav.append('◀️ Предыдущие')
    if page + 1 < pages:
        nav.append('Следующие ▶️')
    if nav:
        rows.append(nav)
    rows += [['🔎 Найти аромат', '🏷 Выбрать бренд'], ['⬅️ В каталог']]
    heading = context.user_data.get('results_title', 'Ароматы')
    body = f'{heading}\n\nНайдено: {len(names)}. Страница {page + 1} из {pages}.\nВыберите аромат:' if names else 'Ничего не найдено. Попробуйте часть названия, например: авентус, интерлюд или том форд.'
    await message.reply_text(body, reply_markup=ReplyKeyboardMarkup(rows, resize_keyboard=True))


def order_buttons(name, perfume):
    buttons = []
    for volume, key in [(5, 'price5'), (10, 'price10')]:
        price = money(perfume[key])
        text = f'Здравствуйте! Хочу заказать {name}, {volume} мл — {price}. Атомайзер включён. Подскажите наличие и способ получения.'
        buttons.append(InlineKeyboardButton(f'{volume} мл · {price}', url=f'https://t.me/{SELLER}?text={quote(text, safe="")}'))
    fragrantica_row = [InlineKeyboardButton('Смотреть на Fragrantica', url=f'https://www.fragrantica.com/search/?query={quote(name)}')]
    return InlineKeyboardMarkup([buttons, fragrantica_row])


async def send_catalog(update, context):
    message, chat = update.effective_message, update.effective_chat
    if message is None or chat is None:
        return
    if chat.type != 'private':
        bot = await context.bot.get_me()
        await message.reply_text('🌸 Каталог «Нота 59»\n\nВыбирайте ароматы в личном чате с ботом.', reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton('🌸 Открыть каталог', url=f'https://t.me/{bot.username}?start=catalog')]]))
        return
    context.user_data.clear()
    await message.reply_text(f'🌸 Каталог «Нота 59»\n\nАроматов: {len(PERFUMES)}\nОбъёмы 5 и 10 мл. Атомайзер включён.\n\nВведите часть названия или выберите поиск и бренды:', reply_markup=catalog_menu())


async def start(update, context):
    message, chat = update.effective_message, update.effective_chat
    if message is None or chat is None:
        return
    if chat.type != 'private' or (context.args and context.args[0] == 'catalog'):
        await send_catalog(update, context)
        return
    context.user_data.clear()
    await message.reply_text('Добро пожаловать в «Нота 59»! 🌸\n\nПарфюмерия на распив.\nВыберите нужный раздел на клавиатуре ниже.', reply_markup=main_menu())


async def show_perfume(message, name):
    perfume = PERFUMES[name]
    if perfume['photo']:
        path = os.path.join(BASE_DIR, perfume['photo'])
        if os.path.isfile(path):
            try:
                with open(path, 'rb') as photo:
                    await message.reply_photo(photo=photo, caption=name)
            except TelegramError:
                logging.exception('Не удалось отправить фото %s', name)
        else:
            logging.warning('Фото не найдено: %s', path)
    text = (f'🌸 {name}\n\nОПИСАНИЕ\n{perfume["description"]}\n\nПИРАМИДА / НОТЫ ПО FRAGRANTICA\n{perfume["notes"]}\n\nОБЪЁМЫ И ЦЕНЫ\n• 5 мл — {money(perfume["price5"])}\n• 10 мл — {money(perfume["price10"])}\n\nАтомайзер включён в стоимость.\n\nНажмите нужный объём и отправьте подготовленное сообщение продавцу. До оплаты уточните наличие и способ получения.\n@{SELLER}')
    await message.reply_text(text, reply_markup=order_buttons(name, perfume))


SECTIONS = {
    '🛒 Как купить': '🛒 Как купить\n\nОткройте каталог, найдите аромат по названию или бренду и нажмите кнопку 5 мл или 10 мл в карточке. Откроется чат продавца с подготовленным сообщением — отправьте его самостоятельно.\n\nДо оплаты уточните наличие, стоимость и способ получения.\nАтомайзер включён.\n@kodenn88',
    '💬 Связаться': '💬 Администратор «Нота 59»\n\nПо вопросам наличия ароматов и оформления заказа:\n@kodenn88\nhttps://t.me/kodenn88',
    '📜 Правила': '📜 Нота 59\n\nЗдесь обсуждаем парфюмерию, распивы, впечатления и подбор ароматов.\n\nМожно:\n• делиться впечатлениями и вопросами;\n• искать аромат по настроению или нотам;\n• обращаться за помощью с выбором.\n\nНельзя:\n• размещать сторонние ссылки без согласования;\n• рекламировать другие магазины и каналы;\n• предлагать сделки в обход администратора.\n\nЗаказы оформляются через бот или @kodenn88.',
}


async def handle_message(update, context):
    message = update.effective_message
    if message is None:
        return
    text = (message.text or '').strip()
    if text in ('🌸 Каталог', '⬅️ В каталог'):
        await send_catalog(update, context)
    elif text == '⬅️ Главное меню':
        context.user_data.clear()
        await message.reply_text('Выберите нужный раздел:', reply_markup=main_menu())
    elif text == '🔎 Найти аромат':
        await message.reply_text('🔎 Напишите название или его часть на русском или латинице.\n\nНапример: авентус, интерлюд, гедонист или Tom Ford.\nПоиск начинается после отправки сообщения.', reply_markup=catalog_menu())
    elif text == '🏷 Выбрать бренд':
        await message.reply_text('🏷 Выберите бренд:', reply_markup=brand_menu())
    elif text == '📋 Все ароматы':
        await show_results(message, context, NAMES, '📋 Все ароматы')
    elif text in BRANDS:
        await show_results(message, context, [name for name in NAMES if BRAND_OF[name] == text], '🏷 ' + text)
    elif text in ('◀️ Предыдущие', 'Следующие ▶️'):
        if 'results' not in context.user_data:
            await send_catalog(update, context)
        else:
            step = 1 if text == 'Следующие ▶️' else -1
            await show_results(message, context, page=context.user_data.get('page', 0) + step)
    elif ALIASES.get(text, text) in PERFUMES:
        await show_perfume(message, ALIASES.get(text, text))
    elif text in SECTIONS:
        await message.reply_text(SECTIONS[text], reply_markup=main_menu())
    else:
        await show_results(message, context, find_perfumes(text), '🔎 Результаты поиска')


async def group_rules(update, context):
    if update.effective_message:
        await update.effective_message.reply_text('📜 Нота 59\n\nЗдесь обсуждаем парфюмерию, распивы, впечатления и подбор ароматов.\n\nМожно:\n• делиться впечатлениями и вопросами;\n• искать аромат по настроению или нотам;\n• обращаться за помощью с выбором.\n\nНельзя:\n• размещать сторонние ссылки без согласования;\n• рекламировать другие магазины и каналы;\n• предлагать сделки в обход администратора.\n\nЗаказы оформляются через бот или @kodenn88.', reply_markup=report.report_keyboard())


async def welcome_members(update, context):
    message = update.effective_message
    if message is None:
        return
    for member in message.new_chat_members:
        if not member.is_bot:
            await message.reply_text(f'🌸 {member.first_name}, добро пожаловать в «Нота 59»!\n\nЗдесь собраны ароматы на распив — чтобы познакомиться с композицией, носить любимый парфюм с собой или попробовать то, что пока не хочется брать целым флаконом.\n\nОбъёмы: 5 и 10 мл. Атомайзер включён в стоимость.\n\nКаталог: /catalog\nИнформация группы: /rules\nПо вопросам заказов: @kodenn88', reply_markup=report.report_keyboard())


def command_allowed(context, user_id, key, limit, window):
    data = context.bot_data.setdefault('command_log', {})
    now = time.monotonic()
    stamps = [stamp for stamp in data.get((key, user_id), []) if now - stamp <= window]
    if len(stamps) >= limit:
        data[(key, user_id)] = stamps
        return False
    stamps.append(now)
    data[(key, user_id)] = stamps
    return True


async def ban_spammer(update, context):
    message, chat, user = update.effective_message, update.effective_chat, update.effective_user
    if message is None or chat is None or chat.type not in ('group', 'supergroup'):
        return
    if message.sender_chat is not None or user is None:
        await message.reply_text('Отправьте команду от своего личного аккаунта, не анонимно и не от имени канала.')
        return
    if not command_allowed(context, user.id, 'ban', 3, 60):
        await message.reply_text('Слишком много команд /ban за минуту. Попробуйте позже.')
        return
    try:
        moderator = await context.bot.get_chat_member(chat.id, user.id)
        if not (moderator.status == 'creator' or (moderator.status == 'administrator' and moderator.can_restrict_members)):
            await message.reply_text('Команда доступна только владельцу группы и администраторам с правом блокировки.')
            return
        replied = message.reply_to_message
        if replied is None:
            await message.reply_text('Ответьте на сообщение спамера командой /ban.\nВнимание: блокировка бессрочная.')
            return
        if replied.sender_chat is not None or replied.from_user is None:
            await message.reply_text('Эта команда блокирует только пользователей, не каналы или анонимных администраторов.')
            return
        target = replied.from_user
        if target.id in (user.id, context.bot.id):
            await message.reply_text('Нельзя заблокировать себя или этого бота.')
            return
        target_member = await context.bot.get_chat_member(chat.id, target.id)
        if target_member.status in ('creator', 'administrator'):
            await message.reply_text('Владельца группы и администраторов эта команда не блокирует.')
            return
        bot_member = await context.bot.get_chat_member(chat.id, context.bot.id)
        if bot_member.status != 'administrator' or not bot_member.can_restrict_members:
            await message.reply_text('Выдайте мне права администратора с разрешением блокировать пользователей.')
            return
        await context.bot.ban_chat_member(chat_id=chat.id, user_id=target.id)
    except TelegramError:
        logging.exception('Не удалось выполнить команду /ban')
        await message.reply_text('Не удалось выполнить блокировку. Проверьте права бота и логи BotHost.')
        return
    slog.log_event('ban', chat.id, target.id, f'Заблокирован администратором {user.id}')
    await message.reply_text(f'🚫 Пользователь {target.full_name} заблокирован.\nID: {target.id}\n\nБлокировка бессрочная. Снять её можно в настройках группы.')


async def warn_spammer(update, context):
    message, chat, user = update.effective_message, update.effective_chat, update.effective_user
    if message is None or chat is None or chat.type not in ('group', 'supergroup'):
        return
    if message.sender_chat is not None or user is None:
        await message.reply_text('Отправьте команду от своего личного аккаунта, не анонимно и не от имени канала.')
        return
    if not command_allowed(context, user.id, 'warn', 5, 60):
        await message.reply_text('Слишком много команд /warn за минуту. Попробуйте позже.')
        return
    try:
        moderator = await context.bot.get_chat_member(chat.id, user.id)
        if not (moderator.status == 'creator' or (moderator.status == 'administrator' and moderator.can_restrict_members)):
            await message.reply_text('Команда доступна только владельцу группы и администраторам с правом блокировки.')
            return
        replied = message.reply_to_message
        if replied is None:
            await message.reply_text('Ответьте на сообщение участника командой /warn.')
            return
        if replied.sender_chat is not None or replied.from_user is None:
            await message.reply_text('Предупреждать можно только пользователей, не каналы или анонимных администраторов.')
            return
        target = replied.from_user
        if target.id in (user.id, context.bot.id):
            await message.reply_text('Нельзя предупредить себя или этого бота.')
            return
        target_member = await context.bot.get_chat_member(chat.id, target.id)
        if target_member.status in ('creator', 'administrator'):
            await message.reply_text('Владельца группы и администраторов эта команда не предупреждает.')
            return
    except TelegramError:
        logging.exception('Не удалось выполнить команду /warn')
        await message.reply_text('Не удалось выполнить предупреждение. Проверьте права бота и логи BotHost.')
        return
    count = slog.count_kind_for_user('warn', target.id) + 1
    reason = ' '.join(context.args) if context.args else 'нарушение правил группы'
    slog.log_event('warn', chat.id, target.id, f'Предупреждение {count} от администратора {user.id}: {reason}')
    await message.reply_text(f'⚠️ {target.full_name}, предупреждение {count}.\nПричина: {reason}.\n\nАвтоматические муты и баны не применяются.')


PROTECTED_GROUP_ID = -5479944910
SECURITY_OWNER_ID = 832210856
ALLOWED_LINK_DOMAINS = frozenset({'fragrantica.ru', 'randewoo.ru'})


def link_is_allowed(raw):
    if not isinstance(raw, str) or not raw or len(raw) > 4096 or raw != raw.strip():
        return False
    if '\\' in raw or any(c.isspace() or unicodedata.category(c).startswith('C') for c in raw):
        return False
    candidate = 'https:' + raw if raw.startswith('//') else raw
    if '://' not in candidate:
        candidate = 'https://' + candidate
    try:
        p = urlsplit(candidate)
        if p.scheme.lower() not in {'http', 'https'} or not p.netloc:
            return False
        if p.username is not None or p.password is not None or '%' in p.netloc:
            return False
        host = p.hostname
        if not host or not host.isascii() or host.endswith('.'):
            return False
        host = host.lower()
        if any(not label or len(label) > 63 or label.startswith('-') or label.endswith('-') or re.fullmatch(r'[a-z0-9-]+', label) is None for label in host.split('.')):
            return False
        if p.port not in (None, 443 if p.scheme.lower() == 'https' else 80):
            return False
        return any(host == domain or host.endswith('.' + domain) for domain in ALLOWED_LINK_DOMAINS)
    except (ValueError, UnicodeError):
        return False


def message_links(message):
    result = set()
    kinds = [MessageEntity.URL, MessageEntity.TEXT_LINK]
    for entities in (message.parse_entities(types=kinds), message.parse_caption_entities(types=kinds)):
        for entity, visible in entities.items():
            value = entity.url if entity.type == MessageEntity.TEXT_LINK else visible
            if value:
                result.add(value)
    return result


async def security_notice(bot, data, text, force=False):
    now = time.monotonic()
    if not force and now - data.get('security_notice_at', -1000) < 60:
        return
    data['security_notice_at'] = now
    try:
        await bot.send_message(SECURITY_OWNER_ID, '🛡 Нота 59\n\n' + text)
    except TelegramError:
        logging.warning('Уведомление владельцу не доставлено; откройте личный чат бота и нажмите /start')


async def check_security(application):
    data = application.bot_data
    data['link_filter_enabled'] = False
    try:
        chat = await application.bot.get_chat(PROTECTED_GROUP_ID)
        if chat.id != PROTECTED_GROUP_ID or chat.type not in ('group', 'supergroup'):
            raise ValueError('Ожидалась указанная группа')
        member = await application.bot.get_chat_member(chat.id, application.bot.id)
        if member.status != 'administrator' or not member.can_delete_messages:
            data['security_status'] = 'Фильтр выключен: нужны права администратора с удалением сообщений.'
        else:
            data['link_filter_enabled'] = True
            data['security_status'] = f'Фильтр включён для группы {chat.id}. Разрешены fragrantica.ru и randewoo.ru и их поддомены. Муты и автобаны выключены.'
    except (TelegramError, ValueError):
        data['security_status'] = f'Фильтр выключен: Telegram не подтвердил доступ к группе {PROTECTED_GROUP_ID}. Проверьте ID и членство бота. ID не изменён автоматически.'
    logging.info('%s', data['security_status'])
    slog.log_event('security_status', PROTECTED_GROUP_ID, None, data['security_status'])
    await security_notice(application.bot, data, data['security_status'], force=True)


async def my_chat_member_update(update, context):
    change = update.my_chat_member
    chat = update.effective_chat
    if change is None or chat is None or chat.id != PROTECTED_GROUP_ID:
        return
    new_status = change.new_chat_member.status
    if new_status not in ('member', 'administrator'):
        text = f'Бот больше не участник группы {chat.id} (статус: {new_status}). Фильтр ссылок и /report могут не работать. Проверьте группу и добавьте бота заново.'
    elif new_status != 'administrator' or not change.new_chat_member.can_delete_messages:
        text = f'Бот в группе {chat.id}, но не имеет прав администратора с удалением сообщений. Фильтр ссылок выключен.'
    else:
        text = f'Бот имеет нужные права в группе {chat.id}. Фильтр ссылок включён.'
    logging.info('%s', text)
    slog.log_event('bot_rights', chat.id, None, text)
    await security_notice(context.bot, context.bot_data, text, force=True)
    await check_security(context.application)


async def security_command(update, context):
    m, u = update.effective_message, update.effective_user
    if m is None or u is None or m.sender_chat is not None or u.id != SECURITY_OWNER_ID:
        return
    if update.effective_chat.type != 'private':
        await m.reply_text('Диагностика доступна владельцу в личном чате бота: /security')
        return
    await check_security(context.application)


async def security_ids(update, context):
    m, u, chat = update.effective_message, update.effective_user, update.effective_chat
    if m is None or u is None or chat is None or m.sender_chat is not None or u.id != SECURITY_OWNER_ID:
        return
    await m.reply_text(f'ID текущего чата: {chat.id}\nВаш ID: {u.id}\nНастроенная группа: {PROTECTED_GROUP_ID}')


async def group_link_filter(update, context):
    m, chat = update.effective_message, update.effective_chat
    if m is None or chat is None or chat.id != PROTECTED_GROUP_ID or chat.type not in ('group', 'supergroup'):
        return
    if not context.bot_data.get('link_filter_enabled', False):
        return
    links = message_links(m)
    if not links or all(link_is_allowed(link) for link in links):
        return
    if m.sender_chat is not None:
        if m.sender_chat.id == chat.id:
            return
        actor = f'чат/канал {m.sender_chat.id}'
        actor_id = m.sender_chat.id
    else:
        user = m.from_user
        if user is None or user.id == context.bot.id:
            return
        try:
            member = await context.bot.get_chat_member(chat.id, user.id)
        except TelegramError:
            await security_notice(context.bot, context.bot_data, f'Не удалось проверить права отправителя в группе {chat.id}. Сообщение {m.message_id} не удалено.')
            return
        if member.status in ('creator', 'administrator'):
            return
        actor = f'пользователь {user.id}'
        actor_id = user.id
    recent = context.bot_data.setdefault('link_filter_recent', {})
    now = time.monotonic()
    for key, stamp in list(recent.items()):
        if now - stamp > 300:
            recent.pop(key, None)
    event = (chat.id, m.message_id, m.edit_date)
    if event in recent:
        raise ApplicationHandlerStop
    try:
        await m.delete()
    except TelegramError:
        await security_notice(context.bot, context.bot_data, f'Запрещённая ссылка обнаружена, но сообщение {m.message_id} в группе {chat.id} не удалено. Проверьте права бота. Мут и бан не применялись.')
        raise ApplicationHandlerStop
    if len(recent) >= 1000:
        recent.pop(next(iter(recent)), None)
    recent[event] = now
    logging.info('Фильтр удалил сообщение: chat_id=%s message_id=%s', chat.id, m.message_id)
    slog.log_event('link_deleted', chat.id, actor_id, f'Сообщение {m.message_id}; отправитель: {actor}; ссылки: {", ".join(sorted(links))[:500]}')
    await security_notice(context.bot, context.bot_data, f'Удалено сообщение {m.message_id} в группе {chat.id}. Отправитель: {actor}. Причина: ссылка вне разрешённого списка. Мут и бан не применялись.')
    raise ApplicationHandlerStop


async def error_handler(update, context):
    error = context.error
    if error is not None:
        logging.error('Необработанная ошибка бота: %s', type(error).__name__)


def main():
    token = os.environ.get('BOT_TOKEN', '').strip()
    if not token:
        raise RuntimeError('Добавьте переменную BOT_TOKEN в настройках хостинга.')
    slog.init()
    application = Application.builder().token(token).post_init(check_security).build()
    application.add_handler(MessageHandler(filters.ChatType.GROUPS & (filters.TEXT | filters.CAPTION), group_link_filter), group=-1)
    application.add_handler(ChatMemberHandler(my_chat_member_update, ChatMemberHandler.MY_CHAT_MEMBER))
    application.add_handler(CommandHandler('security', security_command))
    application.add_handler(CommandHandler('security_ids', security_ids))
    report.register(application)
    application.add_handler(CommandHandler('warn', warn_spammer, filters=filters.ChatType.GROUPS))
    application.add_handler(CommandHandler('ban', ban_spammer, filters=filters.ChatType.GROUPS))
    application.add_handler(CommandHandler('rules', group_rules, filters=filters.ChatType.GROUPS))
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS & filters.ChatType.GROUPS, welcome_members))
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('catalog', send_catalog))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND & filters.ChatType.PRIVATE, handle_message))
    application.add_error_handler(error_handler)
    application.run_polling(allowed_updates=['message', 'edited_message', 'my_chat_member', 'callback_query'])


if __name__ == '__main__':
    main()

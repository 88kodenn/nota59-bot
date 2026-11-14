"""Note corrections and image overrides for mini app only.
Costa Azzurra excluded from note corrections.
Naxos follows the selected Fragrantica outline, not the manufacturer outline.
"""
from urllib.parse import quote

NOTE_FIXES = {
    'Creed Absolu Aventus 2025': 'Верх: ананас, чёрная смородина, грейпфрут, розовый перец, бергамот, лимон.\nСердце: кардамон, корица, имбирь.\nБаза: ветивер, пачули.',
    'Ex Nihilo The Hedonist': 'Верх: бергамот, имбирь.\nСердце: Akigalawood, кедр.\nБаза: ветивер, бобы тонка, мускус.',
    'Ex Nihilo The Hedonist Extrait': 'Верх: грейпфрут, имбирь, бергамот.\nСердце: Akigalawood, личи, кедр.\nБаза: амбровое дерево, ветивер, пачули, бобы тонка.',
    'Parfums de Marly Herod': 'Верх: корица, пеппервуд.\nСердце: лист табака, ладан, османтус, лабданум.\nБаза: ваниль, Iso E Super, кедр, мускус, нагармота, ветивер, амбра.',
    'Tom Ford Neroli Portofino EDP': 'Верх: бергамот, мандарин, лимон, горький апельсин, лаванда, розмарин, мирт.\nСердце: африканский цветок апельсина, нероли, жасмин, питтоспорум.\nБаза: амбра, амбретта, дягиль.',
    'Tom Ford Soleil Blanc EDP': 'Верх: фисташки, бергамот, кардамон, розовый перец.\nСердце: тубероза, иланг-иланг, жасмин.\nБаза: кокос, амбра, бобы тонка, бензоин.',
    'Xerjoff Naxos': 'Верх: лаванда, бергамот, лимон.\nСердце: мёд, корица, кашмеран, жасмин самбак.\nБаза: лист табака, ваниль, бобы тонка.',
}

IMAGE_FILES = {
    'Amouage Interlude Man': 'Amouage interlude.JPG',
    'Amouage Interlude Black Iris Man': 'Amouage black iris man .JPG',
    'Amouage Purpose 50': 'Amouage purpose 50.JPG',
    'Essential Parfums Bois Imperial': 'Bois imperial .JPG',
    'Clive Christian Jump Up And Kiss Me Hedonistic (2021)': 'Clive Christian hedonistic .JPG',
    'Creed Aventus': 'Creed Aventus .JPG',
    'Creed Absolu Aventus 2025': 'Creed Aventus absolu 2025.JPG',
    'Ex Nihilo The Hedonist Extrait': 'Ex nihilo The hedonist extrait.JPG',
    'Ex Nihilo Blue Talisman': 'Ex nihilo blue talisman .JPG',
    'Ex Nihilo The Hedonist': 'Ex nihilo the hedonist .JPG',
    'Initio Wild Rush': 'Initio wild rush .JPG',
    'Jean Paul Gaultier Le Male Elixir': 'Jpg le male elixir.JPG',
    'Jean Paul Gaultier Le Male Le Parfum': 'Jpg le male le parfum .JPG',
    'Louis Vuitton Pacific Chill': 'Louis Vuitton pacific chill.JPG',
    'Maison Crivelli Oud Maracuja': 'Oud maracuja.JPG',
    'Parfums de Marly Herod': 'Pdm Herod .JPG',
    'Parfums de Marly Althair': 'Pdm althair .JPG',
    'Viktor & Rolf Spicebomb': 'Spicebomb .JPG',
    'Tom Ford Costa Azzurra EDP': 'Tom ford Costa azzura .JPG',
    'Tom Ford Grey Vetiver EDP': 'Tom ford grey vetiver .JPG',
    'Tom Ford Neroli Portofino EDP': 'Tom ford neroli portofino.JPG',
    'Tom Ford Noir Extreme EDP': 'Tom ford noir extreme .JPG',
    'Tom Ford Ombré Leather EDP': 'Tom ford ombré leather .JPG',
    'Tom Ford Soleil Blanc EDP': 'Tom ford soleil blanc .JPG',
    'Xerjoff Naxos': 'Xerjoff Naxos .JPG',
}

# Match full fragrance suffixes where catalogue names may include house prefixes.
IMAGE_SUFFIXES = {
    'by the fireplace': 'By the fireplace.JPG',
    'by the fireplace edt': 'By the fireplace.JPG',
    'stronger with you intensely': 'Stronger with you intensely .JPG',
    'stronger with you intensely edp': 'Stronger with you intensely .JPG',
    'tonka cola': 'Tonka cola .JPG',
    'tonka cola edp': 'Tonka cola .JPG',
    'dior sauvage': 'Dior Sauvage .JPG',
    'dior sauvage edt': 'Dior Sauvage .JPG',
}

IMAGE_BASE = 'https://raw.githubusercontent.com/88kodenn/nota59-bot/refs/heads/feature/orders-mvp/'
IMAGE_OVERRIDES = {name: IMAGE_BASE + quote(filename, safe='') for name, filename in IMAGE_FILES.items()}


def apply_note_fixes(items):
    for item in items:
        name = item.get('name', '')
        replacement = NOTE_FIXES.get(name)
        if replacement is not None:
            item['notes'] = replacement
        image = IMAGE_OVERRIDES.get(name)
        if image is None:
            normalized = ' '.join(name.casefold().split())
            for suffix, filename in IMAGE_SUFFIXES.items():
                if normalized == suffix or normalized.endswith(' ' + suffix):
                    image = IMAGE_BASE + quote(filename, safe='')
                    break
        if image is not None:
            item['image'] = image

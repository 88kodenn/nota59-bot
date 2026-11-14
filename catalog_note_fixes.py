"""Note corrections and image overrides for mini app only.
Costa Azzurra excluded from note corrections.
Naxos follows the selected Fragrantica outline, not the manufacturer outline.
"""

NOTE_FIXES = {
    'Creed Absolu Aventus 2025': 'Верх: ананас, чёрная смородина, грейпфрут, розовый перец, бергамот, лимон.\nСердце: кардамон, корица, имбирь.\nБаза: ветивер, пачули.',
    'Ex Nihilo The Hedonist': 'Верх: бергамот, имбирь.\nСердце: Akigalawood, кедр.\nБаза: ветивер, бобы тонка, мускус.',
    'Ex Nihilo The Hedonist Extrait': 'Верх: грейпфрут, имбирь, бергамот.\nСердце: Akigalawood, личи, кедр.\nБаза: амбровое дерево, ветивер, пачули, бобы тонка.',
    'Parfums de Marly Herod': 'Верх: корица, пеппервуд.\nСердце: лист табака, ладан, османтус, лабданум.\nБаза: ваниль, Iso E Super, кедр, мускус, нагармота, ветивер, амбра.',
    'Tom Ford Neroli Portofino EDP': 'Верх: бергамот, мандарин, лимон, горький апельсин, лаванда, розмарин, мирт.\nСердце: африканский цветок апельсина, нероли, жасмин, питтоспорум.\nБаза: амбра, амбретта, дягиль.',
    'Tom Ford Soleil Blanc EDP': 'Верх: фисташки, бергамот, кардамон, розовый перец.\nСердце: тубероза, иланг-иланг, жасмин.\nБаза: кокос, амбра, бобы тонка, бензоин.',
    'Xerjoff Naxos': 'Верх: лаванда, бергамот, лимон.\nСердце: мёд, корица, кашмеран, жасмин самбак.\nБаза: лист табака, ваниль, бобы тонка.',
}

IMAGE_OVERRIDES = {
    'Jean Paul Gaultier Le Male Le Parfum': 'https://raw.githubusercontent.com/88kodenn/nota59-bot/refs/heads/feature/orders-mvp/Photoroom_20261114_152912.jpeg',
}


def apply_note_fixes(items):
    for item in items:
        name = item.get('name')
        replacement = NOTE_FIXES.get(name)
        if replacement is not None:
            item['notes'] = replacement
        image = IMAGE_OVERRIDES.get(name)
        if image is not None:
            item['image'] = image

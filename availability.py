"""Availability and price overrides shared by catalogue and order validation."""
import json

UNAVAILABLE = frozenset({'Kilian Angels Share'})
PRICE_OVERRIDES = {
    'Tom Ford Ombré Leather EDP': {'price5': 850, 'price10': 1700},
}


def install(app):
    if getattr(app, '_n59_availability_installed', False):
        return
    original_load = app.load_catalog
    original_validate = app.orders._validate_items

    def load_catalog():
        raw, photos = original_load()
        payload = json.loads(raw)
        for item in payload['items']:
            prices = PRICE_OVERRIDES.get(item.get('name'))
            if prices is not None:
                item.update(prices)
            if item.get('name') in UNAVAILABLE:
                item['available'] = False
                item['availability_label'] = 'Временно нет в наличии'
        return json.dumps(payload, ensure_ascii=False).encode('utf-8'), photos

    def validate_items(raw_items, catalog_index):
        items, total = original_validate(raw_items, catalog_index)
        for item in items:
            if item['name'] in UNAVAILABLE:
                raise ValueError(item['name'] + ' — временно нет в наличии. Удалите аромат из корзины перед оформлением.')
        return items, total

    app.load_catalog = load_catalog
    app.orders._validate_items = validate_items
    app._n59_availability_installed = True

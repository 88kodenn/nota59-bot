"""Approved description-only overrides for the Mini App catalogue."""
import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def load_descriptions():
    path = Path(__file__).with_name('catalog_descriptions.json')
    values = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(values, dict) or not all(isinstance(k, str) and isinstance(v, str) and v.strip() for k, v in values.items()):
        raise ValueError('Invalid approved catalogue descriptions')
    return values


def apply_descriptions(items):
    values = load_descriptions()
    for item in items:
        replacement = values.get(item.get('name', ''))
        if replacement is not None:
            item['description'] = replacement

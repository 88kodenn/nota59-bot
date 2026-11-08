from pathlib import Path
import re
import shutil
import subprocess

p = Path('main.py')
if not p.exists():
    raise SystemExit('main.py не найден. Запустите скрипт из папки проекта.')

s = p.read_text(encoding='utf-8')
shutil.copy2(p, p.with_suffix('.py.bak'))

old = "BRAND_OF = {name: next(brand for brand in BRANDS if name.startswith(brand + ' ')) for name in NAMES}"
new = "BRAND_OF = {name: next((brand for brand in BRANDS if name.startswith(brand + ' ')), '') for name in NAMES}"

if old in s:
    s = s.replace(old, new)
    print('BRAND_OF исправлен точной заменой')
else:
    pattern = r"BRAND_OF\s*=\s*\{name:\s*next\(brand for brand in BRANDS if name\.startswith\(brand \+ ' '\)\) for name in NAMES\}"
    s2, n = re.subn(pattern, new, s)
    if n:
        s = s2
        print(f'BRAND_OF исправлен по regex, замен: {n}')
    else:
        raise SystemExit('Не нашёл строку BRAND_OF. Проверьте, что файл main.py не изменён.')

p.write_text(s, encoding='utf-8')
print('main.py обновлён, резервная копия main.py.bak создана')

def run(cmd):
    print('>', ' '.join(cmd))
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        raise SystemExit(f'Команда завершилась с ошибкой: {result.returncode}')

run(['git', 'add', 'main.py'])
run(['git', 'commit', '-m', 'fix: make BRAND_OF resilient to unknown brands'])
run(['git', 'push', 'origin', 'main'])
print('Изменения отправлены в GitHub')

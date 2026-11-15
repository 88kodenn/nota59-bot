"""Catalogue-based gift sets integrated with the existing cart and orders."""
import base64
import hashlib
import html
import json
import re
import time
from urllib.parse import urlsplit
import orders

FORMATS = {'trio': (3, 5, 'Три настроения'), 'duo': (2, 10, 'Особенная пара')}
PACKAGING = 300

def validate(raw, index, validate_items):
    fmt = raw.get('format')
    if not isinstance(fmt, str) or fmt not in FORMATS:
        raise ValueError('Неизвестный формат набора')
    count, volume, title = FORMATS[fmt]
    qty = raw.get('qty', 1)
    selected = raw.get('items')
    if type(qty) is not int or not 1 <= qty <= 10:
        raise ValueError('Допустимо от 1 до 10 одинаковых наборов')
    if not isinstance(selected, list) or len(selected) != count:
        raise ValueError('Заполните все места в наборе')
    clean = []
    for item in selected:
        if not isinstance(item, dict):
            raise ValueError('Некорректный состав набора')
        name, brand = item.get('name'), item.get('brand')
        if not isinstance(name, str) or not isinstance(brand, str):
            raise ValueError('Некорректный аромат')
        product = index.get((name, brand))
        if not product or product.get('available') is False:
            raise ValueError('Аромат недоступен: ' + name)
        checked, _ = validate_items([dict(name=name, brand=brand, volume=volume, qty=1)], index)
        clean.extend(checked)
    price = sum(i['total'] for i in clean) + PACKAGING
    if type(raw.get('quote')) is not int or raw['quote'] != price:
        raise ValueError('Цена набора изменилась. Откройте редактирование и сохраните набор заново')
    return dict(kind='gift', format=fmt, name=title, brand='Нота 59', volume=0, qty=qty, items=clean, packaging=PACKAGING, price=price, total=price*qty)

def item_text(item):
    if item.get('kind') != 'gift':
        return item['name'] + ' — ' + str(item['volume']) + ' мл × ' + str(item['qty'])
    return item['name'] + ' × ' + str(item['qty']) + '\n' + '\n'.join('  '+i['name']+' — '+str(i['volume'])+' мл' for i in item['items']) + '\n  Упаковка: 300 ₽ за набор'

def install(app, base):
    old_validate, old_create = orders._validate_items, orders.create_order
    old_text, old_page = orders._seller_text, app._order_page
    original_server = app.ThreadingHTTPServer
    script = (base / 'web_gifts.js').read_bytes()
    def validate_all(raw, index):
        if not isinstance(raw, list) or not 1 <= len(raw) <= 20 or any(not isinstance(x, dict) for x in raw):
            raise ValueError('В корзине должно быть от 1 до 20 позиций')
        result = []
        for row in raw:
            if row.get('kind') == 'gift':
                result.append(validate(row, index, old_validate))
            else:
                checked, _ = old_validate([row], index)
                result.extend(checked)
        return result, sum(i['total'] for i in result)
    def create(payload, index, token, seller):
        raw = payload.get('items') if isinstance(payload, dict) else None
        if not isinstance(raw, list) or not any(isinstance(i, dict) and i.get('kind')=='gift' for i in raw):
            return old_create(payload, index, token, seller)
        user = orders.validate_init_data(payload.get('initData'), token)
        items, total = validate_all(raw, index)
        customer = payload.get('customer')
        if not isinstance(customer, dict):
            raise ValueError('Заполните данные покупателя')
        fields = {}
        for key, limit in dict(name=100, contact=100, carrier=40, address=300, comment=500).items():
            value = customer.get(key, '')
            if not isinstance(value, str) or len(value)>limit:
                raise ValueError('Некорректное поле: '+key)
            fields[key] = value.strip()
        receipt = customer.get('receipt')
        if not fields['name'] or not re.fullmatch(r'@?[A-Za-z][A-Za-z0-9_]{3,31}', fields['contact']):
            raise ValueError('Укажите имя и Telegram в формате @username')
        if receipt not in ('pickup', 'delivery'):
            raise ValueError('Укажите способ получения')
        if receipt=='delivery' and (not fields['address'] or fields['carrier'] not in ('yandex','ozon')):
            raise ValueError('Выберите доставку и укажите адрес')
        key = payload.get('requestKey')
        if not isinstance(key, str) or not re.fullmatch(r'[a-f0-9]{32}', key):
            raise ValueError('Некорректный ключ заказа. Откройте корзину заново')
        digest = hashlib.sha256(json.dumps([raw,fields,receipt], ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        now, duplicate = int(time.time()), False
        with orders._connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            previous = conn.execute('SELECT * FROM orders WHERE user_id=? AND request_key=?', (user['id'],key)).fetchone()
            if previous:
                if previous['request_hash'] != digest:
                    raise ValueError('Состав заказа изменился. Обновите корзину')
                number, duplicate = previous['order_number'], True
            else:
                if conn.execute('SELECT COUNT(*) FROM orders WHERE user_id=? AND created_at>?', (user['id'],now-60)).fetchone()[0]>=5:
                    raise ValueError('Слишком много заказов. Подождите минуту')
                number = '59-'+str(conn.execute('SELECT COALESCE(MAX(id),0)+1 FROM orders').fetchone()[0]).zfill(4)
                conn.execute('INSERT INTO orders (order_number,user_id,username,customer_name,contact,receipt,carrier,address,comment,items_json,total,status,created_at,updated_at,order_type,request_key,request_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', (number,user['id'],user.get('username',''),fields['name'],fields['contact'],receipt,fields['carrier'],fields['address'] if receipt=='delivery' else '',fields['comment'],json.dumps(items,ensure_ascii=False),total,'new',now,now,'catalog',key,digest))
        order = orders.get_order(number,user['id'])
        notified = None if duplicate else orders._notify_seller(order,token,seller)
        return dict(ok=True,order_number=number,total=order['total'],status=order['status'],status_label=order['status_label'],seller_notified=notified,duplicate=duplicate)
    def seller_text(order):
        if not any(i.get('kind')=='gift' for i in order['items']):
            return old_text(order)
        lines = ['Новый заказ '+order['order_number'],'Покупатель: '+order['customer_name'],'Telegram: '+order['contact']]
        for item in order['items']:
            lines.extend(['',item_text(item),'Стоимость: '+orders._money(item['total'])])
        lines.extend(['','Итого с упаковкой: '+orders._money(order['total']),'Получение: '+('самовывоз' if order['receipt']=='pickup' else 'доставка')])
        if order['receipt']=='delivery':
            lines.extend(['Служба: '+order['carrier'],'Адрес: '+order['address']])
        if order['comment']:
            lines.append('Комментарий: '+order['comment'])
        return '\n'.join(lines)
    def page(order):
        if not any(i.get('kind')=='gift' for i in order['items']):
            return old_page(order)
        text = '\n\n'.join(item_text(i)+'\nСтоимость: '+orders._money(i['total']) for i in order['items'])
        return '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Заказ</title><body><h1>Заказ '+html.escape(order['order_number'])+'</h1><pre style="white-space:pre-wrap">'+html.escape(text)+'</pre><p>Итого с упаковкой: '+orders._money(order['total'])+'</p><p>'+html.escape(order['status_label'])+'</p></body></html>'
    def patch(body):
        replacements = [
            ("saved.filter(r=>r&&typeof r.name", "saved.filter(r=>window.n59Gift.valid(r)||r&&typeof r.name"),
            ("function price(r){const p=product(r)", "function price(r){if(r.kind==='gift')return window.n59Gift.price(r);const p=product(r)"),
            ("rows.forEach((r,i)=>{const cost=price(r);", "rows.forEach((r,i)=>{if(r.kind==='gift'){list.append(window.n59Gift.row(r,()=>{rows.splice(i,1);persist();},()=>{panel.close();window.n59Gift.edit(r,g=>{rows[i]=g;persist();});},()=>{if(r.qty<10){r.qty++;persist();}},()=>{if(r.qty>1)r.qty--;else rows.splice(i,1);persist();}));if(price(r)===null)invalid=true;else sum+=price(r)*r.qty;return;}const cost=price(r);"),
            ("rows.map((r,i)=>(i+1)", "rows.map((r,i)=>r.kind==='gift'?window.n59Gift.cartText(r):(i+1)"),
            ("panel.addEventListener('close',()=>fab.focus());draw();", "window.n59Gift.add=g=>{if(rows.length>=20)throw new Error('В корзине уже 20 позиций');rows.push(g);persist();};window.n59Gift.redraw=draw;panel.addEventListener('close',()=>fab.focus());draw();"),
            ("const title=row.querySelector('strong')?.textContent;", "if(row.dataset.gift)return JSON.parse(row.dataset.gift);const title=row.querySelector('strong')?.textContent;"),
            ("...body,initData:initData()", "...body,requestKey:await window.n59Gift.requestKey(body),initData:initData()"),
            ("item.name+' · '+item.volume+' мл × '+item.qty", "window.n59Gift.itemText(item)"),
            ("Итого за товары: ", "Итого (включая упаковку наборов): "),
        ]
        for old,new in replacements:
            if old.encode() not in body:
                raise RuntimeError('Gift integration anchor missing: '+old[:70])
            body = body.replace(old.encode(),new.encode())
        return body.replace(b'<head>',b'<head><script>'+script+b'</script>',1)
    def server(address,handler):
        old_send,old_get = handler._send,handler.do_GET
        def send(self,status,body,mime):
            if status==200 and mime.startswith('text/html') and b'id="catalog"' in body:
                body = patch(body)
            return old_send(self,status,body,mime)
        def get(self):
            path = urlsplit(self.path).path
            names = {'/assets/gift-duo.jpg':'Photoroom_20261115_163215.jpeg','/assets/gift-trio.jpg':'Photoroom_20261115_163132.jpeg'}
            name = names.get(path)
            if name:
                source = base/name
                if source.is_file():
                    return self._send(200,source.read_bytes(),'image/jpeg')
                images = json.loads((base/'gift_images.json').read_text())
                return self._send(200,base64.b64decode(images['duo' if path.endswith('gift-duo.jpg') else 'trio']),'image/jpeg')
            return old_get(self)
        handler._send,handler.do_GET = send,get
        return original_server(address,handler)
    orders._validate_items,orders.create_order = validate_all,create
    orders._seller_text,app._order_page,app.ThreadingHTTPServer = seller_text,page,server
    return patch

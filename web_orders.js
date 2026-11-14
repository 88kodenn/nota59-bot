/* Нота 59 — минимальная система заказов */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const tg = window.Telegram?.WebApp;
  const checkout = $('n59-checkout');
  const message = $('n59-message');
  const form = $('n59-form');

  if (!checkout || !message || !form || checkout.dataset.ordersReady === '1') return;
  checkout.dataset.ordersReady = '1';

  const money = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  const initData = () => tg?.initData || '';

  const readCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('nota59-cart-v2') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  };

  const seller = () => {
    try {
      return typeof data !== 'undefined' && data?.seller ? data.seller : 'kodenn88';
    } catch {
      return 'kodenn88';
    }
  };

  const buildOrderPayload = () => {
    const rows = readCart();
    if (!rows.length) throw new Error('Корзина пуста');

    return {
      initData: initData(),
      items: rows.map((row) => ({
        name: row.name,
        brand: row.brand,
        volume: row.volume,
        qty: row.qty,
      })),
      customer: {
        name: $('n59-name')?.value.trim() || '',
        contact: $('n59-contact')?.value.trim() || '',
        receipt: $('n59-receipt')?.value || 'delivery',
        carrier: $('n59-carrier')?.value || '',
        address: $('n59-address')?.value.trim() || '',
        comment: $('n59-comment')?.value.trim() || '',
      },
    };
  };

  const showStatus = (text, isError = false) => {
    message.textContent = text;
    message.style.color = isError ? '#e08b72' : '';
  };

  const submitOrder = async (event) => {
    event.preventDefault();

    if (!initData()) {
      showStatus('Откройте каталог через Telegram, чтобы оформить заказ.', true);
      return;
    }

    checkout.setAttribute('aria-disabled', 'true');
    checkout.style.pointerEvents = 'none';
    showStatus('Сохраняем заказ…');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOrderPayload()),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось оформить заказ');
      }

      message.innerHTML = '';

      const title = document.createElement('strong');
      title.textContent = `Заказ №${result.order_number} принят`;

      const details = document.createElement('p');
      details.textContent = `Итого за товары: ${money(result.total)}. Статус: ${result.status_label}.`;

      const contact = document.createElement('a');
      contact.href = `https://t.me/${seller()}`;
      contact.target = '_blank';
      contact.rel = 'noopener noreferrer';
      contact.textContent = 'Написать продавцу ↗';
      contact.style.color = '#dfbb78';

      message.append(title, details, contact);
      checkout.textContent = 'Заказ сохранён';
    } catch (error) {
      showStatus(error.message || 'Не удалось оформить заказ. Попробуйте ещё раз.', true);
    } finally {
      checkout.removeAttribute('aria-disabled');
      checkout.style.pointerEvents = '';
    }
  };

  checkout.addEventListener('click', submitOrder);

  const ordersButton = document.createElement('button');
  ordersButton.type = 'button';
  ordersButton.textContent = 'Мои заказы';
  ordersButton.style.cssText = 'width:100%;min-height:44px;margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:7px;background:#211b13;color:var(--gold);font:500 14px var(--sans)';

  const showOrders = async () => {
    if (!initData()) {
      showStatus('Откройте каталог через Telegram, чтобы увидеть заказы.', true);
      return;
    }

    showStatus('Загружаем заказы…');

    try {
      const response = await fetch(`/api/orders?init=${encodeURIComponent(initData())}`);
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось загрузить заказы');
      }

      if (!result.orders.length) {
        showStatus('Заказов пока нет.');
        return;
      }

      message.innerHTML = '';

      const title = document.createElement('strong');
      title.textContent = 'Мои заказы';
      message.append(title);

      result.orders.forEach((order) => {
        const row = document.createElement('p');
        row.textContent = `${order.order_number} — ${money(order.total)} — ${order.status_label}`;
        message.append(row);
      });
    } catch (error) {
      showStatus(error.message || 'Не удалось загрузить заказы.', true);
    }
  };

  ordersButton.addEventListener('click', showOrders);
  form.before(ordersButton);
})();

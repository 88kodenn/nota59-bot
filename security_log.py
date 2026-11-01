import logging
import os
import sqlite3
import time

DB_PATH = os.environ.get('SECURITY_DB_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'security_log.db'))


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts REAL NOT NULL,
        kind TEXT NOT NULL,
        chat_id INTEGER,
        user_id INTEGER,
        details TEXT
    )''')
    return conn


def init():
    try:
        conn = _connect()
        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.exception('Не удалось инициализировать журнал безопасности')


def log_event(kind, chat_id=None, user_id=None, details=''):
    try:
        conn = _connect()
        conn.execute('INSERT INTO events (ts, kind, chat_id, user_id, details) VALUES (?, ?, ?, ?, ?)', (time.time(), kind, chat_id, user_id, str(details)[:1000]))
        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.exception('Не удалось записать событие в журнал безопасности')


def recent(limit=20):
    try:
        conn = _connect()
        rows = conn.execute('SELECT ts, kind, chat_id, user_id, details FROM events ORDER BY id DESC LIMIT ?', (limit,)).fetchall()
        conn.close()
        return rows
    except sqlite3.Error:
        logging.exception('Не удалось прочитать журнал безопасности')
        return []


def count_kind_for_user(kind, user_id):
    try:
        conn = _connect()
        row = conn.execute('SELECT COUNT(*) FROM events WHERE kind = ? AND user_id = ?', (kind, user_id)).fetchone()
        conn.close()
        return row[0] if row else 0
    except sqlite3.Error:
        logging.exception('Не удалось посчитать события в журнале безопасности')
        return 0

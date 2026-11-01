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

# ПОЛНЫЙ РАБОЧИЙ КОД БОТА «НОТА 59»
# Версия: 4b790b9 + кнопка Fragrantica в карточках

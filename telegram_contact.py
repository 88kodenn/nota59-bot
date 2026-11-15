"""Replace legacy checkout phone UI in served HTML and JavaScript."""

def patch(body):
    replacements = [
        ("Телефон или Telegram *", "Telegram *"),
        ("Телефон *", "Telegram *"),
        ("Укажите телефон или Telegram.", "Укажите Telegram в формате @username."),
        ("Укажите телефон.", "Укажите Telegram в формате @username."),
        ("+7… или @username", "@username"),
        ("+7 999 123-45-67", "@username"),
        ("contact.type='tel';contact.inputMode='tel';contact.autocomplete='tel';", "contact.type='text';contact.inputMode='text';contact.autocomplete='off';contact.autocapitalize='none';contact.spellcheck=false;"),
        ("contact.setAttribute('aria-label','Телефон')", "contact.setAttribute('aria-label','Telegram')"),
        ("const prefill=()=>{if(!contact.value.trim())contact.value='+7';};", "const prefill=()=>{const username=window.Telegram?.WebApp?.initDataUnsafe?.user?.username;if(!contact.value.trim()&&username)contact.value='@'+username;};"),
        ("if(contact.value==='+7')contact.setSelectionRange(2,2);", ""),
        ("const digits=value.replace(/\\D/g,'');if(!/^[+0-9\\s().-]+$/.test(value)||digits.length<7||digits.length>15)return 'Введите номер телефона с кодом страны, например @username.';", "if(!/^@?[A-Za-z][A-Za-z0-9_]{3,31}$/.test(value))return 'Укажите Telegram в формате @username.';"),
    ]
    for old, new in replacements:
        body = body.replace(old.encode('utf-8'), new.encode('utf-8'))
    return body

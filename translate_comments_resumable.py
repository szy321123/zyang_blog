import re
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except Exception:
    raise SystemExit("deep_translator not installed")

FILE = Path('_config.butterfly.yml')

re_has_cn = re.compile(r'[\u4e00-\u9fff]')
re_has_en = re.compile(r'[A-Za-z]')
re_url = re.compile(r'https?://', re.I)

# 不翻译这些纯分隔或符号注释
re_skip_symbol = re.compile(r'^[\-_=~*#\s:/.|]+$')

translator = GoogleTranslator(source='en', target='zh-CN')

def should_translate(comment_text: str) -> bool:
    t = comment_text.strip()
    if not t:
        return False
    if re_skip_symbol.fullmatch(t):
        return False
    if re_has_cn.search(t):
        return False
    if re_url.search(t):
        return False
    if not re_has_en.search(t):
        return False
    return True


def count_remaining(lines):
    c = 0
    for line in lines:
        s = line.lstrip()
        if not s.startswith('#'):
            continue
        t = s[1:].strip()
        if should_translate(t):
            c += 1
    return c


def run_one_round():
    lines = FILE.read_text(encoding='utf-8').splitlines(True)
    out = []
    translated = 0
    skipped = 0

    for line in lines:
        s = line.lstrip()
        if not s.startswith('#'):
            out.append(line)
            continue

        comment = s[1:].strip()
        if not should_translate(comment):
            out.append(line)
            continue

        indent = line[:len(line)-len(s)]
        ok = False
        last_err = None
        for _ in range(3):
            try:
                zh = translator.translate(comment)
                if zh and zh.strip():
                    out.append(f"{indent}# {zh.strip()}\n")
                    translated += 1
                    ok = True
                    break
            except Exception as e:
                last_err = e
                time.sleep(0.8)

        if not ok:
            out.append(line)
            skipped += 1

        time.sleep(0.2)

    FILE.write_text(''.join(out), encoding='utf-8')
    remain = count_remaining(FILE.read_text(encoding='utf-8').splitlines())
    print(f"translated={translated}, skipped={skipped}, remaining_english={remain}")
    return remain


if __name__ == '__main__':
    remain = count_remaining(FILE.read_text(encoding='utf-8').splitlines())
    if remain == 0:
        print(f"Nothing to translate.")
        print(f"FINAL remaining_english={remain}")
    else:
        for i in range(1, 7):
            print(f"--- round {i} ---")
            remain = run_one_round()
            if remain == 0:
                break
        print(f"FINAL remaining_english={remain}")

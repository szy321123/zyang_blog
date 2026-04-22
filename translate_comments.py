import re
from deep_translator import GoogleTranslator
import time

def is_chinese(text):
    return any("\u4e00" <= char <= "\u9fff" for char in text)

def is_url(text):
    return re.search(r"http[s]?://", text) is not None

def contains_alpha(text):
    return any(c.isalpha() for c in text)

translator = GoogleTranslator(source="en", target="zh-CN")

input_file = "_config.butterfly.yml"
with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

output_lines = []
translated_count = 0
limit = 50 # Small batch to avoid timeout/rate limit

for line in lines:
    if translated_count >= limit:
        output_lines.append(line)
        continue

    stripped = line.lstrip()
    if stripped.startswith("#"):
        comment_content = stripped[1:].strip()
        if comment_content and contains_alpha(comment_content) and not is_chinese(comment_content) and not is_url(comment_content):
            try:
                translated = translator.translate(comment_content)
                indent = line[:line.find("#")]
                output_lines.append(f"{indent}# {translated}\n")
                translated_count += 1
                time.sleep(0.5) # Slight delay
                continue
            except Exception as e:
                print(f"Error: {e}")
    
    output_lines.append(line)

with open(input_file, "w", encoding="utf-8") as f:
    f.writelines(output_lines)

print(f"Partially translated {translated_count} lines.")

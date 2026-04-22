import yaml
import sys

try:
    with open('_config.butterfly.yml', 'r', encoding='utf-8') as f:
        yaml.safe_load(f)
    print("YAML syntax is valid.")
except Exception as e:
    print(f"YAML Syntax Error: {e}")
    sys.exit(1)

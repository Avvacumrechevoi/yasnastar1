import json
import re
from collections import defaultdict, Counter
from pathlib import Path

SRC = Path('/home/ubuntu/summarize_yasna_lessons.json')
OUT = Path('/home/ubuntu/yasna-interface-mockups/research/yasna_dataset.json')


def normalize_family(name: str) -> str:
    n = name.strip()
    low = n.lower()
    if 'домашних животных' in low or 'двора' in low:
        return 'Ясна домашних животных'
    if 'суток' in low:
        return 'Ясна суток'
    if 'круговорота воды' in low:
        return 'Ясна круговорота воды'
    if 'облачности' in low or 'радуги' in low:
        return 'Ясна облачности и цветов радуги'
    return n


def lesson_sort_key(label: str) -> int:
    m = re.search(r'(\d+)', label or '')
    return int(m.group(1)) if m else 999


def parse_points(raw: str):
    if not raw or raw.strip().lower() == 'не указано':
        return {}
    parts = [p.strip().strip('.') for p in raw.split(', ')]
    merged = []
    current = None
    for part in parts:
        if '=' in part:
            if current:
                merged.append(current)
            current = part
        elif current:
            current += ', ' + part
        else:
            current = part
    if current:
        merged.append(current)

    result = defaultdict(list)
    for item in merged:
        if '=' not in item:
            continue
        left, right = item.split('=', 1)
        left = left.strip()
        right = right.strip()
        if left.isdigit() and right:
            result[int(left)].append(right)
    return result


def split_semicolon(raw: str):
    if not raw or raw.strip().lower() == 'не указано':
        return []
    return [x.strip().strip('.') for x in raw.split(';') if x.strip()]


def choose_title(family: str) -> str:
    mapping = {
        'Ясна домашних животных': 'Домашние животные',
        'Ясна суток': 'Сутки',
        'Ясна круговорота воды': 'Круговорот воды',
        'Ясна облачности и цветов радуги': 'Облачность и радуга',
    }
    return mapping.get(family, family)


with SRC.open('r', encoding='utf-8') as f:
    payload = json.load(f)

families = defaultdict(lambda: {
    'family': '',
    'title': '',
    'lessons': [],
    'point_sources': defaultdict(list),
    'mechanics': Counter(),
    'notes': [],
    'topics': [],
})

for item in payload['results']:
    output = item.get('output') or {}
    family = normalize_family(output.get('yasna_family', 'Неизвестная Ясна'))
    bucket = families[family]
    bucket['family'] = family
    bucket['title'] = choose_title(family)
    lesson = {
        'file': output.get('lesson_file', ''),
        'lesson': output.get('lesson_number', ''),
        'topics': output.get('key_topics', '').strip(),
        'point_assignments': output.get('point_assignments', '').strip(),
        'mechanics_mentions': split_semicolon(output.get('mechanics_mentions', '')),
        'interface_notes': output.get('interface_notes', '').strip(),
    }
    bucket['lessons'].append(lesson)
    bucket['topics'].append(lesson['topics'])
    bucket['notes'].append(lesson['interface_notes'])

    for point_idx, values in parse_points(lesson['point_assignments']).items():
        bucket['point_sources'][point_idx].extend(values)

    for mech in lesson['mechanics_mentions']:
        bucket['mechanics'][mech] += 1

result = []
for family, bucket in families.items():
    lessons = sorted(bucket['lessons'], key=lambda x: lesson_sort_key(x['lesson']))
    point_map = {}
    for idx in range(12):
        values = bucket['point_sources'].get(idx, [])
        if not values:
            point_map[str(idx)] = ''
            continue
        counts = Counter(values)
        ordered = [text for text, _ in counts.most_common()]
        point_map[str(idx)] = ' | '.join(ordered[:3])

    mechanics = [name for name, _count in bucket['mechanics'].most_common()]
    notes = [n for n in bucket['notes'] if n]
    summary = ' '.join([t for t in bucket['topics'][:2] if t])[:900]
    result.append({
        'id': family.lower().replace('ясна ', '').replace(' и ', '-').replace(' ', '-'),
        'family': family,
        'title': bucket['title'],
        'lesson_count': len(lessons),
        'summary': summary,
        'mechanics': mechanics,
        'points': point_map,
        'lessons': lessons,
        'notes': notes[:4],
    })

result = sorted(result, key=lambda x: ['Ясна суток', 'Ясна домашних животных', 'Ясна круговорота воды', 'Ясна облачности и цветов радуги'].index(x['family']) if x['family'] in ['Ясна суток', 'Ясна домашних животных', 'Ясна круговорота воды', 'Ясна облачности и цветов радуги'] else 99)

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(OUT)

#!/usr/bin/env python3
"""
Patch index.html to add:
1. New data arrays: nodeCloudType, nodeWindSolution, atmosphereSigns
2. Enhanced cloud block in renderMiniCard (when 'cloud' mode is active, show cloud type + wind solution)
3. New glossary section for Атмосфера Переговоров
"""

import re

with open('/home/ubuntu/yasna_3d/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ═══════════════════════════════════════
# 1. ADD NEW DATA ARRAYS after nodeSutki
# ═══════════════════════════════════════

cloud_data = '''
// ── Cloud-Problem types per node (Ясна 2: Облака = Проблемы) ──
const nodeCloudType = [
  { genus:'Nimbostratus (Ns)', name:'Затяжной конфликт', tier:'Нижний ярус', tierIcon:'⬇️', desc:'Тёмно-серый сплошной слой, обложной дождь. Длительное противостояние, изматывающий спор без конца.', color:'#6b7b8d' },
  { genus:'Stratus (St)', name:'Серая безнадёжность', tier:'Нижний ярус', tierIcon:'⬇️', desc:'Однородная серая пелена, морось. Апатия, «ничего не меняется», потеря мотивации к диалогу.', color:'#8899aa' },
  { genus:'Stratocumulus (Sc)', name:'Рутинные препятствия', tier:'Нижний ярус', tierIcon:'⬇️', desc:'Серые гряды с просветами. Бюрократия, процедурные вопросы, «мелочи» которые тормозят.', color:'#7a8a9a' },
  { genus:'Altocumulus (Ac)', name:'Волны разногласий', tier:'Средний ярус', tierIcon:'🔶', desc:'Волны, гряды, пластины. Периодические всплески несогласия, волнообразные споры.', color:'#a0b0c0' },
  { genus:'Altostratus (As)', name:'Затуманивание позиций', tier:'Средний ярус', tierIcon:'🔶', desc:'Серая пелена, солнце как через матовое стекло. Стороны уходят в абстракции, теряют ясность.', color:'#90a0b0' },
  { genus:'Cumulus (Cu)', name:'Острый вопрос', tier:'Вертикальное развитие', tierIcon:'⬆️', desc:'Плотные белые «башни», чёткие границы. Конкретная проблема, которая «вырастает» на глазах.', color:'#d0d8e0' },
  { genus:'—', name:'Ясное небо', tier:'—', tierIcon:'☀️', desc:'Ни одного облака. Максимальная ясность — проблем нет, чистый диалог.', color:'#f0e68c' },
  { genus:'Cirrus (Ci)', name:'Намёки и предчувствия', tier:'Верхний ярус', tierIcon:'⬆️', desc:'Тонкие, нитевидные, почти невидимые. Лёгкие оговорки, неуловимое напряжение, «что-то не так».', color:'#c8d8e8' },
  { genus:'Cirrocumulus (Cc)', name:'Рябь сомнений', tier:'Верхний ярус', tierIcon:'⬆️', desc:'Мелкие хлопья, «барашки». Серия мелких вопросов, переглядывания, микро-возражения.', color:'#b8c8d8' },
  { genus:'Cirrostratus (Cs)', name:'Пелена недоверия', tier:'Верхний ярус', tierIcon:'⬆️', desc:'Тонкая пелена, солнце видно через дымку. Формальная вежливость при внутреннем недоверии.', color:'#a8b8c8' },
  { genus:'Cumulonimbus (Cb)', name:'Кризис / Гроза', tier:'Вертикальное развитие', tierIcon:'⚡', desc:'Мощные башни до 12+ км, грозы, ливни, град. Полный кризис: ультиматумы, угрозы, срыв переговоров.', color:'#5a6a7a' },
  { genus:'Nimbostratus (Ns)', name:'Затяжной конфликт', tier:'Нижний ярус', tierIcon:'⬇️', desc:'Одна сплошная туча, переход к новому циклу. Затяжной конфликт переходит в осмысление.', color:'#6b7b8d' }
];

// ── Wind-Solution types per node (Ясна 3: Ветер = Управленческие приёмы) ──
const nodeWindSolution = [
  { wind:'Антициклон', name:'Создание ясности', icon:'🌀', desc:'Зона высокого давления разгоняет облака: структурирование, фиксация договорённостей, протокол. Разложить всё по полочкам.', color:'#7eb8f7' },
  { wind:'Фён', name:'Тёплое отношение', icon:'🌡️', desc:'Тёплый нисходящий ветер: комплимент, признание заслуг, личная история. Согреть атмосферу, растворить серость.', color:'#f7c97e' },
  { wind:'Пассат', name:'Системное давление', icon:'➡️', desc:'Постоянный устойчивый ветер: последовательные аргументы, методичное продвижение по повестке. Не давить, а двигать.', color:'#a8e6cf' },
  { wind:'Муссон', name:'Стратегический разворот', icon:'🔄', desc:'Мощный сезонный ветер: новое предложение, изменение формата, привлечение нового участника. Сменить направление.', color:'#c8a0e8' },
  { wind:'Фён', name:'Тёплое отношение', icon:'🌡️', desc:'Тёплый нисходящий ветер: согреть атмосферу, признать усилия сторон. Фён растворяет туман сверху.', color:'#f7c97e' },
  { wind:'Шквал', name:'Решительное действие', icon:'💨', desc:'Внезапный сильный ветер: чёткая позиция, дедлайн, контролируемый ультиматум. Быстро и точно.', color:'#ff7b54' },
  { wind:'—', name:'Штиль (ясная погода)', icon:'☀️', desc:'Ветер не нужен — небо чистое. Поддерживай ясность: слушай, подтверждай, фиксируй.', color:'#f0e68c' },
  { wind:'Бриз', name:'Мягкая смена темы', icon:'🍃', desc:'Лёгкий береговой ветерок: переключить внимание, сменить ракурс, задать неожиданный вопрос. Не давить — направить.', color:'#98d8c8' },
  { wind:'Бриз', name:'Мягкая смена темы', icon:'🍃', desc:'Лёгкое дуновение: отвлечь от мелких сомнений, переключить на главное. Бриз рассеивает барашки.', color:'#98d8c8' },
  { wind:'Муссон', name:'Стратегический разворот', icon:'🔄', desc:'Мощная смена направления: пересмотреть формат, предложить новый подход. Пелена недоверия требует радикальных мер.', color:'#c8a0e8' },
  { wind:'Торнадо', name:'Кризисное управление', icon:'🌪️', desc:'Крайняя мера: пауза переговоров, эскалация на высший уровень, привлечение медиатора. Когда всё остальное не работает.', color:'#ff5555' },
  { wind:'Антициклон', name:'Создание ясности', icon:'🌀', desc:'Зона высокого давления: подвести итоги, зафиксировать результаты, создать протокол. Превратить хаос в порядок.', color:'#7eb8f7' }
];

// ── Atmosphere signs / predictions (Ясна 4: Приметы) ──
const atmosphereSigns = [
  { sign:'Тишина перед бурей', prediction:'Полное молчание сторон — признак скрытого конфликта. Готовься к грозе.' },
  { sign:'Туман утром', prediction:'Начало в неясности — нормально. Туман рассеется, когда солнце поднимется.' },
  { sign:'Ветер стихает', prediction:'Если активный диалог вдруг замолкает — надвигается кризис.' },
  { sign:'Перистые облака появились', prediction:'Лёгкие намёки на проблемы — скоро будут серьёзнее. Действуй превентивно.' },
  { sign:'Облака растут вертикально', prediction:'Проблема набирает силу — действуй сейчас, пока не стала грозой.' },
  { sign:'Красный закат', prediction:'Жёсткий разговор сегодня — хорошая погода завтра. Не бойся конфронтации.' },
  { sign:'Радуга после дождя', prediction:'Конфликт разрешён — новые возможности. Зафиксируй результат.' }
];

'''

# Insert after nodeSutki array
sutki_pattern = r"(const nodeSutki\s*=\s*\[.*?\];)"
match_sutki = re.search(sutki_pattern, html, re.DOTALL)
if match_sutki:
    insert_pos = match_sutki.end()
    html = html[:insert_pos] + '\n' + cloud_data + html[insert_pos:]
    print("✅ Inserted cloud data arrays after nodeSutki")
else:
    print("❌ Could not find nodeSutki array")

# ═══════════════════════════════════════
# 2. ENHANCE CLOUD MODE BLOCK IN CARD
# ═══════════════════════════════════════
# Currently the cloud mode just shows d.cloud (first sentence).
# We need to add cloud type + wind solution blocks when cloud mode is active.

# Find the modeInfo block and enhance it
old_mode_block = '''    const mi = modeInfo[m];
    // Show first sentence as the key tezis
    const shortText = mi.text.split('.')[0] + '.';
    modesHtml += `
      <div class="mc-mode-block">
        <div class="mc-mode-label" style="color:${mi.color}">${mi.label}</div>
        <div class="mc-mode-text">${shortText}</div>
      </div>`;'''

new_mode_block = '''    const mi = modeInfo[m];
    // Show first sentence as the key tezis
    const shortText = mi.text.split('.')[0] + '.';
    modesHtml += `
      <div class="mc-mode-block">
        <div class="mc-mode-label" style="color:${mi.color}">${mi.label}</div>
        <div class="mc-mode-text">${shortText}</div>
      </div>`;
    // If cloud mode — add Cloud-Problem and Wind-Solution blocks
    if (m === 'cloud') {
      const ct = nodeCloudType[n];
      const ws = nodeWindSolution[n];
      modesHtml += `
        <div class="mc-layer-block" style="background:rgba(160,176,200,.06);border:1px solid rgba(160,176,200,.1);border-radius:8px;margin-top:4px">
          <div class="mc-layer-label" style="color:${ct.color};font-size:9px;letter-spacing:2px">☁️ ОБЛАКО-ПРОБЛЕМА</div>
          <div class="mc-layer-text" style="font-size:11px;line-height:1.6">
            <div style="margin-bottom:4px"><strong style="color:${ct.color}">${ct.genus}</strong></div>
            <div style="margin-bottom:4px;color:rgba(232,224,208,.9)"><strong>${ct.name}</strong> · ${ct.tierIcon} ${ct.tier}</div>
            <div style="color:rgba(232,224,208,.65);font-size:10.5px">${ct.desc}</div>
          </div>
        </div>
        <div class="mc-layer-block" style="background:rgba(${ws.color === '#f7c97e' ? '247,201,126' : ws.color === '#a8e6cf' ? '168,230,207' : ws.color === '#ff7b54' ? '255,123,84' : ws.color === '#c8a0e8' ? '200,160,232' : ws.color === '#98d8c8' ? '152,216,200' : ws.color === '#ff5555' ? '255,85,85' : ws.color === '#f0e68c' ? '240,230,140' : '126,184,247'},.06);border:1px solid rgba(${ws.color === '#f7c97e' ? '247,201,126' : ws.color === '#a8e6cf' ? '168,230,207' : ws.color === '#ff7b54' ? '255,123,84' : ws.color === '#c8a0e8' ? '200,160,232' : ws.color === '#98d8c8' ? '152,216,200' : ws.color === '#ff5555' ? '255,85,85' : ws.color === '#f0e68c' ? '240,230,140' : '126,184,247'},.1);border-radius:8px;margin-top:4px">
          <div class="mc-layer-label" style="color:${ws.color};font-size:9px;letter-spacing:2px">💨 ВЕТЕР-РЕШЕНИЕ</div>
          <div class="mc-layer-text" style="font-size:11px;line-height:1.6">
            <div style="margin-bottom:4px"><strong style="color:${ws.color}">${ws.icon} ${ws.wind}</strong> — ${ws.name}</div>
            <div style="color:rgba(232,224,208,.65);font-size:10.5px">${ws.desc}</div>
          </div>
        </div>`;
    }'''

if old_mode_block in html:
    html = html.replace(old_mode_block, new_mode_block)
    print("✅ Enhanced cloud mode block in renderMiniCard")
else:
    print("❌ Could not find mode block to enhance")

# ═══════════════════════════════════════
# 3. ENHANCE CLOUD INFO PANEL
# ═══════════════════════════════════════
# Add cloud type and wind solution to the full info panel when cloud mode is active

old_cloud_info = '''  if(activeModes.includes('cloud')) {
    cols += `<div class="info-col">
      <div class="info-col-title"><span class="info-col-icon">☁️</span>Ясна Облачности</div>
      <div class="info-col-text">${d.cloud}</div>
    </div>`;
  }'''

new_cloud_info = '''  if(activeModes.includes('cloud')) {
    const ct = nodeCloudType[n];
    const ws = nodeWindSolution[n];
    cols += `<div class="info-col">
      <div class="info-col-title"><span class="info-col-icon">☁️</span>Ясна Облачности</div>
      <div class="info-col-text">${d.cloud}</div>
      <div style="margin-top:10px;padding:10px;background:rgba(160,176,200,.06);border-radius:8px;border:1px solid rgba(160,176,200,.08)">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${ct.color};margin-bottom:6px">☁️ Облако-проблема</div>
        <div style="font-size:12px;color:#e8e0d0;margin-bottom:4px"><strong>${ct.genus}</strong></div>
        <div style="font-size:12px;color:rgba(232,224,208,.9);margin-bottom:4px"><strong>${ct.name}</strong> · ${ct.tierIcon} ${ct.tier}</div>
        <div style="font-size:11px;color:rgba(232,224,208,.6)">${ct.desc}</div>
      </div>
      <div style="margin-top:8px;padding:10px;background:rgba(126,184,247,.06);border-radius:8px;border:1px solid rgba(126,184,247,.08)">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${ws.color};margin-bottom:6px">💨 Ветер-решение</div>
        <div style="font-size:12px;color:#e8e0d0;margin-bottom:4px"><strong>${ws.icon} ${ws.wind}</strong> — ${ws.name}</div>
        <div style="font-size:11px;color:rgba(232,224,208,.6)">${ws.desc}</div>
      </div>
    </div>`;
  }'''

if old_cloud_info in html:
    html = html.replace(old_cloud_info, new_cloud_info)
    print("✅ Enhanced cloud info panel")
else:
    print("❌ Could not find cloud info panel to enhance")

# ═══════════════════════════════════════
# 4. ADD GLOSSARY SECTION FOR ATMOSPHERE
# ═══════════════════════════════════════
# Find the Русский Крест glossary section and add Атмосфера after it

glossary_section = '''
<!-- ── Атмосфера Переговоров ── -->
<div style="margin-top:36px">
  <h3 style="font-size:16px;letter-spacing:3px;text-transform:uppercase;color:#a0b0c8;margin-bottom:16px;border-bottom:1px solid rgba(160,176,200,.15);padding-bottom:8px">
    ☁️ Атмосфера Переговоров · 4 Ясны
  </h3>

  <!-- Ясна 1: Атмосфера -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(160,176,200,.7);margin-bottom:10px">Ясна 1: Атмосфера встречи (Оболочка)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="padding:10px 12px;background:rgba(160,176,200,.06);border-radius:8px;border:1px solid rgba(160,176,200,.06)">
        <div style="font-size:11px;color:#7eb8f7;margin-bottom:4px"><strong>Тропосфера</strong> (0-12 км)</div>
        <div style="font-size:10.5px;color:rgba(232,224,208,.65)">Рабочее пространство встречи: тон, темп, энергия. Вся «погода» переговоров здесь.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(160,176,200,.06);border-radius:8px;border:1px solid rgba(160,176,200,.06)">
        <div style="font-size:11px;color:#a8e6cf;margin-bottom:4px"><strong>Стратосфера</strong> (12-50 км)</div>
        <div style="font-size:10.5px;color:rgba(232,224,208,.65)">Стратегический контекст: долгосрочные цели сторон, невидимые из рабочей зоны.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(160,176,200,.06);border-radius:8px;border:1px solid rgba(160,176,200,.06)">
        <div style="font-size:11px;color:#c8a0e8;margin-bottom:4px"><strong>Мезосфера</strong> (50-80 км)</div>
        <div style="font-size:10.5px;color:rgba(232,224,208,.65)">Зона отчуждения: непроговорённые обиды, скрытые мотивы, холод между сторонами.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(160,176,200,.06);border-radius:8px;border:1px solid rgba(160,176,200,.06)">
        <div style="font-size:11px;color:#f0e68c;margin-bottom:4px"><strong>Ионосфера</strong> (80+ км)</div>
        <div style="font-size:10.5px;color:rgba(232,224,208,.65)">Высшие ценности: миссия, видение, дух партнёрства. Свечение, которое видно издалека.</div>
      </div>
    </div>
  </div>

  <!-- Ясна 2: Облака = Проблемы -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(160,176,200,.7);margin-bottom:10px">Ясна 2: Облака = Проблемы (10 родов)</div>

    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(200,216,232,.5);margin-bottom:6px">Верхний ярус (6-13 км) — лёгкие, далёкие проблемы</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
      <div style="padding:8px 10px;background:rgba(200,216,232,.05);border-radius:6px;border:1px solid rgba(200,216,232,.06)">
        <div style="font-size:10px;color:#c8d8e8"><strong>Cirrus (Ci)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Намёки и предчувствия</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Тонкие нити — лёгкие оговорки</div>
      </div>
      <div style="padding:8px 10px;background:rgba(200,216,232,.05);border-radius:6px;border:1px solid rgba(200,216,232,.06)">
        <div style="font-size:10px;color:#b8c8d8"><strong>Cirrocumulus (Cc)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Рябь сомнений</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Барашки — микро-возражения</div>
      </div>
      <div style="padding:8px 10px;background:rgba(200,216,232,.05);border-radius:6px;border:1px solid rgba(200,216,232,.06)">
        <div style="font-size:10px;color:#a8b8c8"><strong>Cirrostratus (Cs)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Пелена недоверия</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Дымка — формальная вежливость</div>
      </div>
    </div>

    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(200,216,232,.5);margin-bottom:6px">Средний ярус (2-6 км) — нарастающие проблемы</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div style="padding:8px 10px;background:rgba(160,176,192,.05);border-radius:6px;border:1px solid rgba(160,176,192,.06)">
        <div style="font-size:10px;color:#a0b0c0"><strong>Altostratus (As)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Затуманивание позиций</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Матовое стекло — уход в абстракции</div>
      </div>
      <div style="padding:8px 10px;background:rgba(160,176,192,.05);border-radius:6px;border:1px solid rgba(160,176,192,.06)">
        <div style="font-size:10px;color:#90a0b0"><strong>Altocumulus (Ac)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Волны разногласий</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Волны и гряды — периодические споры</div>
      </div>
    </div>

    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(200,216,232,.5);margin-bottom:6px">Нижний ярус (0-2 км) — тяжёлые, давящие проблемы</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
      <div style="padding:8px 10px;background:rgba(107,123,141,.08);border-radius:6px;border:1px solid rgba(107,123,141,.1)">
        <div style="font-size:10px;color:#7a8a9a"><strong>Stratocumulus (Sc)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Рутинные препятствия</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Серые гряды — бюрократия</div>
      </div>
      <div style="padding:8px 10px;background:rgba(107,123,141,.08);border-radius:6px;border:1px solid rgba(107,123,141,.1)">
        <div style="font-size:10px;color:#8899aa"><strong>Stratus (St)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Серая безнадёжность</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Пелена — апатия, потеря мотивации</div>
      </div>
      <div style="padding:8px 10px;background:rgba(107,123,141,.08);border-radius:6px;border:1px solid rgba(107,123,141,.1)">
        <div style="font-size:10px;color:#6b7b8d"><strong>Nimbostratus (Ns)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Затяжной конфликт</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Сплошной слой — изматывающий спор</div>
      </div>
    </div>

    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(200,216,232,.5);margin-bottom:6px">Вертикальное развитие — взрывные проблемы</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div style="padding:8px 10px;background:rgba(208,216,224,.05);border-radius:6px;border:1px solid rgba(208,216,224,.06)">
        <div style="font-size:10px;color:#d0d8e0"><strong>Cumulus (Cu)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Острый вопрос</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Белые башни — проблема растёт</div>
      </div>
      <div style="padding:8px 10px;background:rgba(90,106,122,.08);border-radius:6px;border:1px solid rgba(90,106,122,.1)">
        <div style="font-size:10px;color:#5a6a7a"><strong>Cumulonimbus (Cb)</strong></div>
        <div style="font-size:10px;color:rgba(232,224,208,.7);margin-top:2px">Кризис / Гроза</div>
        <div style="font-size:9px;color:rgba(232,224,208,.45);margin-top:2px">Мощные башни — полный кризис</div>
      </div>
    </div>
  </div>

  <!-- Ясна 3: Ветер = Решение -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(160,176,200,.7);margin-bottom:10px">Ясна 3: Ветер = Управленческие приёмы</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="padding:10px 12px;background:rgba(152,216,200,.05);border-radius:8px;border:1px solid rgba(152,216,200,.06)">
        <div style="font-size:11px;color:#98d8c8"><strong>🍃 Бриз</strong> — Мягкая смена темы</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Перистые (Ci, Cc, Cs). Переключить внимание, сменить ракурс.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(247,201,126,.05);border-radius:8px;border:1px solid rgba(247,201,126,.06)">
        <div style="font-size:11px;color:#f7c97e"><strong>🌡️ Фён</strong> — Тёплое отношение</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Слоистые (As, St). Комплимент, признание заслуг.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(168,230,207,.05);border-radius:8px;border:1px solid rgba(168,230,207,.06)">
        <div style="font-size:11px;color:#a8e6cf"><strong>➡️ Пассат</strong> — Системное давление</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Слоисто-кучевые (Sc). Методичное продвижение по повестке.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(200,160,232,.05);border-radius:8px;border:1px solid rgba(200,160,232,.06)">
        <div style="font-size:11px;color:#c8a0e8"><strong>🔄 Муссон</strong> — Стратегический разворот</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Высоко-кучевые (Ac), Пелена (Cs). Смена формата.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(255,123,84,.05);border-radius:8px;border:1px solid rgba(255,123,84,.06)">
        <div style="font-size:11px;color:#ff7b54"><strong>💨 Шквал</strong> — Решительное действие</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Кучевые (Cu). Чёткая позиция, дедлайн.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(126,184,247,.05);border-radius:8px;border:1px solid rgba(126,184,247,.06)">
        <div style="font-size:11px;color:#7eb8f7"><strong>🌀 Антициклон</strong> — Создание ясности</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Nimbostratus (Ns). Структурирование, протокол.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(255,85,85,.05);border-radius:8px;border:1px solid rgba(255,85,85,.06)">
        <div style="font-size:11px;color:#ff5555"><strong>🌪️ Торнадо</strong> — Кризисное управление</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Против: Cumulonimbus (Cb). Пауза, эскалация, медиатор.</div>
      </div>
      <div style="padding:10px 12px;background:rgba(240,230,140,.05);border-radius:8px;border:1px solid rgba(240,230,140,.06)">
        <div style="font-size:11px;color:#f0e68c"><strong>☀️ Штиль</strong> — Ясная погода</div>
        <div style="font-size:10px;color:rgba(232,224,208,.55);margin-top:3px">Когда проблем нет. Слушай, подтверждай, фиксируй.</div>
      </div>
    </div>
  </div>

  <!-- Ясна 4: Приметы -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(160,176,200,.7);margin-bottom:10px">Ясна 4: Приметы и предсказания</div>
    <div style="display:grid;grid-template-columns:1fr;gap:6px">
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Тишина перед бурей</strong> — полное молчание сторон = скрытый конфликт. Готовься к грозе.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Туман утром</strong> — начало в неясности нормально. Рассеется, когда солнце поднимется.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Ветер стихает</strong> — если активный диалог замолкает, надвигается кризис.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Перистые облака появились</strong> — лёгкие намёки на проблемы. Действуй превентивно.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Облака растут вертикально</strong> — проблема набирает силу. Действуй сейчас.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Красный закат</strong> — жёсткий разговор сегодня = хорошая погода завтра.</div>
      </div>
      <div style="padding:8px 12px;background:rgba(160,176,200,.04);border-radius:6px;border-left:3px solid rgba(160,176,200,.2)">
        <div style="font-size:11px;color:rgba(232,224,208,.85)"><strong>Радуга после дождя</strong> — конфликт разрешён, новые возможности. Зафиксируй результат.</div>
      </div>
    </div>
  </div>

  <!-- Mapping table -->
  <div style="margin-bottom:20px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(160,176,200,.7);margin-bottom:10px">Маппинг: 12 полочек → Облако → Ветер</div>
    <table style="width:100%;border-collapse:collapse;font-size:10.5px">
      <thead>
        <tr style="border-bottom:1px solid rgba(160,176,200,.15)">
          <th style="padding:6px 8px;text-align:left;color:rgba(160,176,200,.6);font-weight:normal;letter-spacing:1px">#</th>
          <th style="padding:6px 8px;text-align:left;color:rgba(160,176,200,.6);font-weight:normal;letter-spacing:1px">Полочка</th>
          <th style="padding:6px 8px;text-align:left;color:rgba(160,176,200,.6);font-weight:normal;letter-spacing:1px">Облако-проблема</th>
          <th style="padding:6px 8px;text-align:left;color:rgba(160,176,200,.6);font-weight:normal;letter-spacing:1px">Ветер-решение</th>
        </tr>
      </thead>
      <tbody id="glossary-cloud-table-body"></tbody>
    </table>
  </div>
</div>
'''

# Find the philosophy block in glossary to insert before it
philosophy_marker = '<!-- ── Философия ──'
if philosophy_marker in html:
    html = html.replace(philosophy_marker, glossary_section + '\n' + philosophy_marker)
    print("✅ Added Атмосфера glossary section before Философия")
else:
    # Try alternative: find the closing of the glossary content
    alt_marker = '<!-- ── Русский Крест'
    if alt_marker in html:
        # Find the end of Русский Крест section and insert after
        rk_idx = html.index(alt_marker)
        # Find the next </div> that closes the section (look for the next major section)
        next_section = html.find('</div>\n</div>\n</div>', rk_idx + 500)
        if next_section > 0:
            insert_at = next_section + len('</div>')
            html = html[:insert_at] + '\n' + glossary_section + html[insert_at:]
            print("✅ Added Атмосфера glossary section after Русский Крест")
        else:
            print("❌ Could not find insertion point for glossary")
    else:
        print("❌ Could not find glossary insertion point")

# ═══════════════════════════════════════
# 5. ADD GLOSSARY TABLE BUILDER FOR CLOUD MAPPING
# ═══════════════════════════════════════

cloud_table_builder = '''
  // Build cloud mapping table in glossary
  const cloudTbody = document.getElementById('glossary-cloud-table-body');
  if (cloudTbody && cloudTbody.children.length === 0) {
    for (let i = 0; i < 12; i++) {
      const ct = nodeCloudType[i];
      const ws = nodeWindSolution[i];
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid rgba(255,255,255,.04)';
      tr.innerHTML = `
        <td style="padding:5px 8px;color:rgba(160,176,200,.6)">${i}</td>
        <td style="padding:5px 8px;color:rgba(232,224,208,.8)">${D[i].name}</td>
        <td style="padding:5px 8px">
          <span style="color:${ct.color}">${ct.tierIcon} ${ct.name}</span>
          <span style="color:rgba(232,224,208,.35);font-size:9px;margin-left:4px">${ct.genus}</span>
        </td>
        <td style="padding:5px 8px">
          <span style="color:${ws.color}">${ws.icon} ${ws.wind}</span>
          <span style="color:rgba(232,224,208,.35);font-size:9px;margin-left:4px">${ws.name}</span>
        </td>`;
      cloudTbody.appendChild(tr);
    }
  }
'''

# Insert the cloud table builder into buildGlossaryTable function
build_glossary_end = "  }\n}\n\n// ── Init ──"
if build_glossary_end in html:
    html = html.replace(build_glossary_end, "  }\n" + cloud_table_builder + "}\n\n// ── Init ──")
    print("✅ Added cloud table builder to buildGlossaryTable")
else:
    print("❌ Could not find buildGlossaryTable end")

# ═══════════════════════════════════════
# 6. ADD CLOUD COLUMN TO GLOSSARY TABLE
# ═══════════════════════════════════════

# Find the glossary table header to add Cloud column
glossary_header_marker = '<th style="padding:9px 14px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(200,169,110,.5);font-weight:normal">Крест</th>'
if glossary_header_marker in html:
    html = html.replace(
        glossary_header_marker,
        glossary_header_marker + '\n          <th style="padding:9px 14px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(160,176,200,.5);font-weight:normal">Облако</th>'
    )
    print("✅ Added Cloud column header to glossary table")

# Add cloud data to each glossary row
old_cross_cell = '''        <span style="font-size:11px;color:${crossCol};border:1px solid ${crossCol}44;padding:2px 7px;border-radius:8px">${cross}</span>
      </td>`;'''
new_cross_cell = '''        <span style="font-size:11px;color:${crossCol};border:1px solid ${crossCol}44;padding:2px 7px;border-radius:8px">${cross}</span>
      </td>
      <td style="padding:9px 14px">
        <span style="font-size:10px;color:${nodeCloudType[i].color}">${nodeCloudType[i].tierIcon} ${nodeCloudType[i].name}</span>
      </td>`;'''
if old_cross_cell in html:
    html = html.replace(old_cross_cell, new_cross_cell)
    print("✅ Added Cloud data to glossary table rows")

with open('/home/ubuntu/yasna_3d/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\n✅ All patches applied successfully!")

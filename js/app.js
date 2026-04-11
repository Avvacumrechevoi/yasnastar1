import {
  STORAGE_KEY,
  BASE_SHELVES,
  BUILTIN_YASNAS,
  SYNTHESIS_GUIDES,
  DEFAULT_SELECTION,
} from './data.js';

const WORKSPACE_STORAGE_KEY = `${STORAGE_KEY}-meeting-workspace-v1`;

const NEGOTIATION_FORECASTS = [
  {
    sign: 'Если до встречи все говорят осторожно и предпочитают переписку прямому разговору, значит воздух уже насыщен скрытым давлением.',
    forecast: 'На старте придётся не спорить, а повышать видимость: без прояснения скрытых ставок обсуждение останется в тумане.',
    watch: 'Кто избегает прямых формулировок, какие темы нельзя произнести вслух и что уже решается в кулуарах.'
  },
  {
    sign: 'Если первый контакт формален и вежлив, но в нём мало внутреннего импульса, над встречей висит слой пассивности.',
    forecast: 'Без явного обозначения причины встречи разговор быстро станет обязательным ритуалом вместо движения.',
    watch: 'Кто действительно инициатор, какую цену участники видят в бездействии и есть ли у встречи живой запрос.'
  },
  {
    sign: 'Если ещё до начала множатся подтемы, уточнения и параллельные вопросы, повестка уже распадается на фрагменты.',
    forecast: 'Без жёсткого русла разговор будет перескакивать между темами и не создаст общего фронта решения.',
    watch: 'Какой вопрос главный, что можно временно вынести за скобки и где начинаются опасные ответвления.'
  },
  {
    sign: 'Если в первые минуты участники быстро демонстрируют позиции и статус, видимость уже усиливает фронт столкновения.',
    forecast: 'Встреча рано перейдёт в лобовое давление, если не отделить рамку разговора от борьбы за лицо.',
    watch: 'Какие формулы звучат как самоутверждение, где важнее статус, чем предмет, и кто задаёт тон поверхности.'
  },
  {
    sign: 'Если аргументы быстро нагреваются, а обещания становятся красивее фактов, в воздухе появляется пелена перегрева.',
    forecast: 'Без проверки плотности слов встреча уйдёт в тёплую неопределённость и накопит лишнее напряжение.',
    watch: 'Где факт уже подменён интерпретацией, какие обещания пока не имеют меры и где температура растёт быстрее смысла.'
  },
  {
    sign: 'Если у разговора появился повторяющийся узел и все начинают возвращаться к нему разными словами, облако уже собрано.',
    forecast: 'Следующая стадия зависит от точности диагностики: неправильно названное облако приведёт к неверному управленческому ветру.',
    watch: 'Какой именно тип облака формируется — туман, тяжёлый дождевой слой, кучевой рост или грозовая башня.'
  },
  {
    sign: 'Если тема начала двигаться и стороны готовы переносить акцент, значит ветер переговоров уже включился.',
    forecast: 'Энергия может перейти либо в продуктивный рост вариантов, либо в перенос конфликта в более опасный слой.',
    watch: 'Кто управляет направлением разговора, что усиливает полезный поток и где появляется турбулентность.'
  },
  {
    sign: 'Если формулировки становятся резкими, а цена выбора резко возрастает, в системе копится грозовой заряд.',
    forecast: 'Без контролируемого громоотвода встреча уйдёт в разрушительный разряд или жёсткий ультиматум.',
    watch: 'Какие темы нужно развести, где возможна пауза и какой минимум общности ещё удерживает стороны в одном поле.'
  },
  {
    sign: 'Если после острого момента остаются мелкие споры о формулировках и деталях, в воздухе держится рябь после дождя.',
    forecast: 'Договорённость может распасться на придирки, если не уплотнить результат и не сгладить остаточную турбулентность.',
    watch: 'Что является существенным условием, а что уже только следом разряда и не должно стать новым штормом.'
  },
  {
    sign: 'Если все испытывают облегчение, но не могут назвать проверяемый следующий шаг, над землёй висит иллюзия решения.',
    forecast: 'Есть риск virga: решение красиво выглядит, но не доходит до практики и не касается земли.',
    watch: 'Кто владелец действия, какой шаг случится первым и по какому признаку будет видно реальное касание результата.'
  },
  {
    sign: 'Если после встречи остаются тонкие намёки на новые ограничения и скрытые повороты, верхний слой уже рисует следующий фронт.',
    forecast: 'Без чтения слабых сигналов новая проблема возникнет раньше, чем текущие обязательства успеют распределиться.',
    watch: 'Какие новые линии напряжения намечаются, где появляются скрытые сценарии и кто несёт будущий перенос.'
  },
  {
    sign: 'Если после завершения разговора остаётся странное послевкусие или ощущение невидимого влияния, в верхних слоях есть системный риск.',
    forecast: 'Следующий цикл начнётся не с чистого листа: скрытые игроки и внешние ограничения быстро вернутся в переговорное поле.',
    watch: 'Что осталось висеть в воздухе, кто влияет из-за пределов комнаты и какой новый цикл уже начинает собираться.'
  }
];

const state = {
  mode: DEFAULT_SELECTION.mode,
  primaryId: DEFAULT_SELECTION.primaryId,
  secondaryId: DEFAULT_SELECTION.secondaryId,
  shelfIndex: DEFAULT_SELECTION.shelfIndex,
  userYasnas: loadUserYasnas(),
  editingYasnaId: null,
  editingShelfIndex: DEFAULT_SELECTION.shelfIndex,
  workspace: loadWorkspaceDraft(),
};

const elements = {
  modeSwitch: document.getElementById('modeSwitch'),
  primarySelect: document.getElementById('primarySelect'),
  secondarySelect: document.getElementById('secondarySelect'),
  secondarySelectWrap: document.getElementById('secondarySelectWrap'),
  modeSummary: document.getElementById('modeSummary'),
  libraryList: document.getElementById('libraryList'),
  yasnaCountBadge: document.getElementById('yasnaCountBadge'),
  stageTitle: document.getElementById('stageTitle'),
  stageSubtitle: document.getElementById('stageSubtitle'),
  stageCenterCard: document.getElementById('stageCenterCard'),
  yasnaOrbit: document.getElementById('yasnaOrbit'),
  stageFooter: document.getElementById('stageFooter'),
  detailCard: document.getElementById('detailCard'),
  shelfBadge: document.getElementById('shelfBadge'),
  synthesisPanel: document.getElementById('synthesisPanel'),
  synthesisContent: document.getElementById('synthesisContent'),
  constructorOptions: document.getElementById('constructorOptions'),
  constructorCard: document.getElementById('constructorCard'),
  copyCardBtn: document.getElementById('copyCardBtn'),
  createDialog: document.getElementById('createDialog'),
  createForm: document.getElementById('createForm'),
  openCreateBtn: document.getElementById('openCreateBtn'),
  templateSelect: document.getElementById('templateSelect'),
  exportLibraryBtn: document.getElementById('exportLibraryBtn'),
  importLibraryInput: document.getElementById('importLibraryInput'),
  duplicateYasnaBtn: document.getElementById('duplicateYasnaBtn'),
  openEditBtn: document.getElementById('openEditBtn'),
  deleteYasnaBtn: document.getElementById('deleteYasnaBtn'),
  sidebarDuplicateBtn: document.getElementById('sidebarDuplicateBtn'),
  sidebarEditBtn: document.getElementById('sidebarEditBtn'),
  sidebarDeleteBtn: document.getElementById('sidebarDeleteBtn'),
  libraryActionHint: document.getElementById('libraryActionHint'),
  editDialog: document.getElementById('editDialog'),
  editForm: document.getElementById('editForm'),
  editDialogTitle: document.getElementById('editDialogTitle'),
  editTitle: document.getElementById('editTitle'),
  editShortTitle: document.getElementById('editShortTitle'),
  editCategory: document.getElementById('editCategory'),
  editFocus: document.getElementById('editFocus'),
  editSubtitle: document.getElementById('editSubtitle'),
  editDescription: document.getElementById('editDescription'),
  editSynthesisHint: document.getElementById('editSynthesisHint'),
  editShelfSelect: document.getElementById('editShelfSelect'),
  editShelfMeta: document.getElementById('editShelfMeta'),
  editShelfTitle: document.getElementById('editShelfTitle'),
  editShelfEssence: document.getElementById('editShelfEssence'),
  editShelfSignals: document.getElementById('editShelfSignals'),
  editShelfManagement: document.getElementById('editShelfManagement'),
  editShelfTags: document.getElementById('editShelfTags'),
  workspaceForm: document.getElementById('workspaceForm'),
  workspaceMeetingName: document.getElementById('workspaceMeetingName'),
  workspaceParticipants: document.getElementById('workspaceParticipants'),
  workspaceGoal: document.getElementById('workspaceGoal'),
  workspaceStakes: document.getElementById('workspaceStakes'),
  workspaceNotes: document.getElementById('workspaceNotes'),
  workspaceSnapshot: document.getElementById('workspaceSnapshot'),
  workspaceForecast: document.getElementById('workspaceForecast'),
  workspaceOmens: document.getElementById('workspaceOmens'),
  workspaceForecastOutput: document.getElementById('workspaceForecastOutput'),
  copyForecastBtn: document.getElementById('copyForecastBtn'),
  resetWorkspaceBtn: document.getElementById('resetWorkspaceBtn'),
};

init();

function init() {
  ensureValidSelection();
  hydrateTemplateOptions();
  hydrateEditShelfOptions();
  bindEvents();
  render();
}

function bindEvents() {
  elements.modeSwitch.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    state.mode = button.dataset.mode;
    ensureValidSelection();
    render();
  });

  elements.primarySelect.addEventListener('change', (event) => {
    state.primaryId = event.target.value;
    ensureValidSelection();
    render();
  });

  elements.secondarySelect.addEventListener('change', (event) => {
    state.secondaryId = event.target.value;
    ensureValidSelection();
    render();
  });

  elements.constructorOptions.addEventListener('change', () => renderConstructorCard());

  elements.copyCardBtn.addEventListener('click', async () => {
    const text = elements.constructorCard.innerText.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      flashButton(elements.copyCardBtn, 'Скопировано');
    } catch {
      flashButton(elements.copyCardBtn, 'Не удалось скопировать');
    }
  });

  elements.openCreateBtn.addEventListener('click', () => {
    elements.createForm.reset();
    elements.templateSelect.value = state.primaryId;
    elements.createDialog.showModal();
  });

  elements.createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.createForm);
    const templateId = String(formData.get('templateId'));
    const template = getYasnaById(templateId);

    if (!template) return;

    const yasna = createCustomYasnaFromTemplate({
      title: normalizeText(formData.get('title')) || 'Новая Ясна',
      shortTitle: normalizeText(formData.get('shortTitle')) || 'Ясна',
      category: normalizeText(formData.get('category')) || 'Пользовательские',
      subtitle: normalizeText(formData.get('subtitle')) || template.subtitle,
      description: normalizeText(formData.get('description')) || 'Пользовательская отдельная Ясна, созданная на основе выбранного шаблона.',
      focus: normalizeText(formData.get('focus')) || template.focus,
      source: template,
      synthesisHint: 'Синтезируйте эту отдельную Ясну с другими, чтобы обнаруживать новые связи между полочками и расширять предметную карту.',
    });

    state.userYasnas.unshift(yasna);
    persistUserYasnas();
    state.primaryId = yasna.id;
    state.mode = 'single';
    state.shelfIndex = DEFAULT_SELECTION.shelfIndex;
    ensureValidSelection();
    elements.createDialog.close();
    render();
  });

  elements.exportLibraryBtn.addEventListener('click', () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 3,
      userYasnas: state.userYasnas,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yasna-library-export.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  elements.importLibraryInput.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!Array.isArray(payload.userYasnas)) throw new Error('invalid');
      const normalized = payload.userYasnas
        .filter(isValidYasnaShape)
        .map(normalizeImportedYasna);
      state.userYasnas = dedupeYasnas([...normalized, ...state.userYasnas]);
      persistUserYasnas();
      ensureValidSelection();
      render();
    } catch {
      alert('Не удалось импортировать файл. Проверьте, что это JSON-экспорт библиотеки Ясн.');
    } finally {
      event.target.value = '';
    }
  });

  [elements.duplicateYasnaBtn, elements.sidebarDuplicateBtn].forEach((button) => {
    button.addEventListener('click', () => duplicateCurrentYasna());
  });

  [elements.openEditBtn, elements.sidebarEditBtn].forEach((button) => {
    button.addEventListener('click', () => openEditDialog());
  });

  [elements.deleteYasnaBtn, elements.sidebarDeleteBtn].forEach((button) => {
    button.addEventListener('click', () => deleteCurrentYasna());
  });

  elements.editShelfSelect.addEventListener('change', (event) => {
    saveEditShelfDraft();
    state.editingShelfIndex = Number(event.target.value);
    renderEditShelfFields();
  });

  elements.editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveEditShelfDraft();
    applyEditForm();
    elements.editDialog.close();
    render();
  });

  elements.workspaceForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  elements.workspaceForm.addEventListener('input', (event) => {
    const field = event.target.name;
    if (!field || !(field in state.workspace)) return;
    state.workspace[field] = String(event.target.value || '').trim();
    persistWorkspaceDraft();
    renderMeetingWorkspace();
  });

  elements.copyForecastBtn.addEventListener('click', async () => {
    const text = elements.workspaceForecastOutput.innerText.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      flashButton(elements.copyForecastBtn, 'Скопировано');
    } catch {
      flashButton(elements.copyForecastBtn, 'Не удалось скопировать');
    }
  });

  elements.resetWorkspaceBtn.addEventListener('click', () => {
    state.workspace = createEmptyWorkspaceDraft();
    persistWorkspaceDraft();
    renderMeetingWorkspace();
    flashButton(elements.resetWorkspaceBtn, 'Черновик очищен');
  });
}

function render() {
  ensureValidSelection();
  renderModeSwitch();
  renderSelectors();
  renderLibrary();
  renderLibraryActions();
  renderStage();
  renderDetailCard();
  renderSynthesis();
  renderConstructorCard();
  renderMeetingWorkspace();
}

function renderModeSwitch() {
  [...elements.modeSwitch.querySelectorAll('.segmented__item')].forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === state.mode);
  });

  elements.secondarySelectWrap.style.display = state.mode === 'synthesis' ? 'grid' : 'none';

  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();

  if (state.mode === 'single') {
    elements.modeSummary.textContent = `Сейчас вы читаете одну Ясну — «${primary.title}». Справа показывается подробная карточка выбранной полочки и конструктор рабочей аналитики.`;
    return;
  }

  elements.modeSummary.textContent = `Сейчас активен синтез: «${primary.shortTitle}» + «${secondary.shortTitle}». Для каждой полочки показываются соответствия, чтобы видеть связи между слоями.`;
}

function renderSelectors() {
  const yasnas = getAllYasnas();
  elements.primarySelect.innerHTML = yasnas.map((yasna) => optionTemplate(yasna, state.primaryId)).join('');
  elements.secondarySelect.innerHTML = yasnas
    .filter((yasna) => yasna.id !== state.primaryId)
    .map((yasna) => optionTemplate(yasna, state.secondaryId))
    .join('');
}

function renderLibrary() {
  const yasnas = getAllYasnas();
  elements.yasnaCountBadge.textContent = `${yasnas.length} шт.`;
  elements.libraryList.innerHTML = yasnas
    .map((yasna) => {
      const selected = yasna.id === state.primaryId || (state.mode === 'synthesis' && yasna.id === state.secondaryId);
      const role = yasna.id === state.primaryId
        ? 'Основная'
        : state.mode === 'synthesis' && yasna.id === state.secondaryId
          ? 'Вторая'
          : yasna.kind === 'custom'
            ? 'Пользовательская'
            : yasna.category;

      return `
        <button class="library-item ${selected ? 'is-selected' : ''}" data-yasna-id="${yasna.id}">
          <span class="library-item__meta">${escapeHtml(role)}</span>
          <strong>${escapeHtml(yasna.title)}</strong>
          <span>${escapeHtml(yasna.subtitle)}</span>
        </button>
      `;
    })
    .join('');

  [...elements.libraryList.querySelectorAll('[data-yasna-id]')].forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.yasnaId;
      if (state.mode === 'single') {
        state.primaryId = id;
      } else if (id === state.primaryId) {
        state.primaryId = id;
      } else {
        state.secondaryId = id;
      }
      ensureValidSelection();
      render();
    });
  });
}

function renderLibraryActions() {
  const primary = getPrimaryYasna();
  const isCustom = primary.kind === 'custom';
  const hint = isCustom
    ? `Сейчас активна пользовательская Ясна «${primary.title}». Её можно редактировать, дублировать и удалять из библиотеки.`
    : `Сейчас активна встроенная Ясна «${primary.title}». Её нельзя менять напрямую, но можно дублировать как отдельную и затем доработать по 12 полочкам.`;

  elements.libraryActionHint.textContent = hint;
  toggleDisabled(elements.openEditBtn, !isCustom);
  toggleDisabled(elements.sidebarEditBtn, !isCustom);
  toggleDisabled(elements.deleteYasnaBtn, !isCustom);
  toggleDisabled(elements.sidebarDeleteBtn, !isCustom);
}

function renderStage() {
  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();
  const currentBase = BASE_SHELVES[state.shelfIndex];

  elements.stageTitle.textContent = state.mode === 'single'
    ? primary.title
    : `${primary.shortTitle} × ${secondary.shortTitle}`;

  elements.stageSubtitle.textContent = state.mode === 'single'
    ? primary.subtitle
    : `Синтез двух Ясн по единой структуре 12 полочек. Активная полочка: ${currentBase.baseName} (${currentBase.stage}).`;

  elements.stageCenterCard.innerHTML = `
    <p class="eyebrow">Активная полочка</p>
    <h3>${escapeHtml(currentBase.baseName)}</h3>
    <p>${escapeHtml(currentBase.stage)} · ${escapeHtml(currentBase.cycle)}</p>
  `;

  elements.yasnaOrbit.innerHTML = BASE_SHELVES.map((baseShelf, index) => {
    const primaryShelf = primary.shelves[index];
    const secondaryShelf = secondary?.shelves[index];
    const angle = (360 / BASE_SHELVES.length) * index - 90;

    return `
      <button
        class="orbit-shelf ${index === state.shelfIndex ? 'is-active' : ''} ${state.mode === 'synthesis' ? 'orbit-shelf--dual' : ''}"
        style="--angle:${angle}deg"
        data-shelf-index="${index}"
      >
        <span class="orbit-shelf__index">${index + 1}</span>
        <strong>${escapeHtml(baseShelf.baseName)}</strong>
        <span>${escapeHtml(primaryShelf.title)}</span>
        ${secondaryShelf && state.mode === 'synthesis' ? `<em>${escapeHtml(secondaryShelf.title)}</em>` : ''}
      </button>
    `;
  }).join('');

  [...elements.yasnaOrbit.querySelectorAll('[data-shelf-index]')].forEach((button) => {
    button.addEventListener('click', () => {
      state.shelfIndex = Number(button.dataset.shelfIndex);
      render();
    });
  });

  elements.stageFooter.innerHTML = [primary, state.mode === 'synthesis' ? secondary : null]
    .filter(Boolean)
    .map((yasna, index) => `
      <article class="footer-card ${index === 0 ? 'footer-card--primary' : 'footer-card--secondary'}">
        <p class="eyebrow">${index === 0 ? 'Основная Ясна' : 'Вторая Ясна'}</p>
        <h3>${escapeHtml(yasna.title)}</h3>
        <p>${escapeHtml(yasna.description)}</p>
        <div class="tag-row">${yasna.shelves[state.shelfIndex].tags.map(tagChip).join('')}</div>
      </article>
    `)
    .join('');
}

function renderDetailCard() {
  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();
  const baseShelf = BASE_SHELVES[state.shelfIndex];
  const primaryShelf = primary.shelves[state.shelfIndex];
  const guide = getGuide(primary.id, secondary?.id);

  elements.shelfBadge.textContent = `${state.shelfIndex + 1}/12`;

  if (state.mode === 'single') {
    elements.detailCard.innerHTML = detailSection({
      eyebrow: `${primary.shortTitle} · ${baseShelf.baseName}`,
      title: primaryShelf.title,
      subtitle: `${baseShelf.stage} · ${baseShelf.cycle}`,
      essence: primaryShelf.essence,
      signals: primaryShelf.signals,
      management: primaryShelf.management,
      tags: primaryShelf.tags,
      synthesis: primary.synthesisHint,
    });
    return;
  }

  const secondaryShelf = secondary.shelves[state.shelfIndex];
  const synthesisText = guide?.links?.[state.shelfIndex] || 'Для этой пары полочек пока не задано отдельное пояснение. Используйте сопоставление смыслов вручную.';

  elements.detailCard.innerHTML = `
    <div class="detail-stack">
      ${detailSection({
        eyebrow: `${primary.shortTitle} · ${baseShelf.baseName}`,
        title: primaryShelf.title,
        subtitle: 'Первая линия синтеза',
        essence: primaryShelf.essence,
        signals: primaryShelf.signals,
        management: primaryShelf.management,
        tags: primaryShelf.tags,
      })}
      ${detailSection({
        eyebrow: `${secondary.shortTitle} · ${baseShelf.baseName}`,
        title: secondaryShelf.title,
        subtitle: 'Вторая линия синтеза',
        essence: secondaryShelf.essence,
        signals: secondaryShelf.signals,
        management: secondaryShelf.management,
        tags: secondaryShelf.tags,
      })}
      <section class="detail-block detail-block--synthesis">
        <p class="eyebrow">Смысл синтеза</p>
        <h3>${escapeHtml(baseShelf.baseName)}: связь двух полочек</h3>
        <p>${escapeHtml(synthesisText)}</p>
      </section>
    </div>
  `;
}

function renderSynthesis() {
  if (state.mode !== 'synthesis') {
    elements.synthesisPanel.style.display = 'none';
    return;
  }

  elements.synthesisPanel.style.display = 'block';

  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();
  const guide = getGuide(primary.id, secondary.id);

  if (!guide) {
    elements.synthesisContent.innerHTML = `
      <p>Для выбранной пары пока не описан встроенный проводник синтеза. Инструмент всё равно показывает полочки рядом, чтобы вы могли создавать свои связи и отдельные Ясны на их основе.</p>
      ${fallbackSynthesisTable(primary, secondary)}
    `;
    return;
  }

  elements.synthesisContent.innerHTML = `
    <article class="synthesis-summary">
      <p class="eyebrow">${escapeHtml(guide.title)}</p>
      <h3>Карта переходов между полочками</h3>
      <p>${escapeHtml(guide.summary)}</p>
    </article>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Полочка Ясны</th>
            <th>${escapeHtml(primary.shortTitle)}</th>
            <th>${escapeHtml(secondary.shortTitle)}</th>
            <th>Связь</th>
          </tr>
        </thead>
        <tbody>
          ${BASE_SHELVES.map((baseShelf, index) => `
            <tr class="${index === state.shelfIndex ? 'is-row-active' : ''}">
              <td>${index + 1}</td>
              <td>${escapeHtml(baseShelf.baseName)}</td>
              <td>${escapeHtml(primary.shelves[index].title)}</td>
              <td>${escapeHtml(secondary.shelves[index].title)}</td>
              <td>${escapeHtml(guide.links[index] || 'Связь не описана')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderConstructorCard() {
  const options = getActiveConstructorOptions();
  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();
  const baseShelf = BASE_SHELVES[state.shelfIndex];
  const primaryShelf = primary.shelves[state.shelfIndex];
  const secondaryShelf = secondary?.shelves[state.shelfIndex];
  const guide = getGuide(primary.id, secondary?.id);
  const synthesisText = guide?.links?.[state.shelfIndex] || primary.synthesisHint;

  const blocks = [];

  blocks.push(`
    <section class="constructor-card__hero">
      <p class="eyebrow">Рабочая карточка</p>
      <h3>${escapeHtml(baseShelf.baseName)} · ${escapeHtml(primary.shortTitle)}${state.mode === 'synthesis' ? ` × ${escapeHtml(secondary.shortTitle)}` : ''}</h3>
      <p>${escapeHtml(baseShelf.stage)} · ${escapeHtml(baseShelf.cycle)}</p>
    </section>
  `);

  if (options.includes('summary')) {
    blocks.push(sectionBlock('Краткое ядро', state.mode === 'single'
      ? primaryShelf.essence
      : `${primaryShelf.title}: ${primaryShelf.essence} ${secondaryShelf.title}: ${secondaryShelf.essence}`));
  }

  if (options.includes('signals')) {
    blocks.push(sectionBlock('Сигналы и признаки', state.mode === 'single'
      ? primaryShelf.signals
      : `Первая Ясна: ${primaryShelf.signals} Вторая Ясна: ${secondaryShelf.signals}`));
  }

  if (options.includes('management')) {
    blocks.push(sectionBlock('Управленческий приём', state.mode === 'single'
      ? primaryShelf.management
      : `${primary.shortTitle}: ${primaryShelf.management} ${secondary.shortTitle}: ${secondaryShelf.management}`));
  }

  if (options.includes('questions')) {
    blocks.push(sectionBlock('Диагностические вопросы', diagnosticQuestions(baseShelf, primaryShelf, secondaryShelf)));
  }

  if (options.includes('risks')) {
    blocks.push(sectionBlock('Риски и ошибки', riskText(primaryShelf, secondaryShelf)));
  }

  if (options.includes('cross')) {
    blocks.push(`
      <section class="constructor-section">
        <h4>Опорный крест</h4>
        <div class="mini-grid">
          <div><strong>Север</strong><span>Что здесь поднимается вверх и усиливает давление?</span></div>
          <div><strong>Юг</strong><span>Что должно приземлиться и стать фактом?</span></div>
          <div><strong>Запад</strong><span>Что уже накоплено из прошлого цикла?</span></div>
          <div><strong>Восток</strong><span>Какой новый поток начинается отсюда?</span></div>
        </div>
      </section>
    `);
  }

  if (options.includes('fire')) {
    blocks.push(sectionBlock('Стихия огня', fireLens(primaryShelf, secondaryShelf)));
  }

  if (options.includes('synthesis')) {
    blocks.push(sectionBlock('Поле синтеза', synthesisText));
  }

  elements.constructorCard.innerHTML = blocks.join('');
}

function renderMeetingWorkspace() {
  const snapshot = getNegotiationSnapshot();
  const primary = getPrimaryYasna();
  const secondary = getSecondaryYasna();
  const meetingName = state.workspace.meetingName || 'Текущая встреча без названия';
  const participants = state.workspace.participants || 'Состав участников пока не зафиксирован.';
  const goal = state.workspace.goal || 'Цель встречи пока не описана.';
  const stakes = state.workspace.stakes || 'Ставки и ограничения встречи пока не описаны.';
  const notes = state.workspace.notes || 'Рабочие заметки пока не добавлены.';
  const activeGuide = state.mode === 'synthesis' ? getGuide(primary.id, secondary.id) : null;
  const activeGuideText = activeGuide?.links?.[state.shelfIndex] || 'Сейчас вы читаете одну Ясну; для активной полочки можно включить синтез, чтобы увидеть прямую связку двух слоёв.';

  syncInputValue(elements.workspaceMeetingName, state.workspace.meetingName);
  syncInputValue(elements.workspaceParticipants, state.workspace.participants);
  syncInputValue(elements.workspaceGoal, state.workspace.goal);
  syncInputValue(elements.workspaceStakes, state.workspace.stakes);
  syncInputValue(elements.workspaceNotes, state.workspace.notes);

  elements.workspaceSnapshot.innerHTML = `
    <p class="eyebrow">Паспорт встречи</p>
    <h3>${escapeHtml(meetingName)}</h3>
    <p><strong>Активная полочка.</strong> ${escapeHtml(snapshot.baseShelf.baseName)} · ${escapeHtml(snapshot.baseShelf.stage)} · ${escapeHtml(snapshot.baseShelf.cycle)}</p>
    <p><strong>Фокус экрана.</strong> ${escapeHtml(state.mode === 'single' ? primary.title : `${primary.shortTitle} × ${secondary.shortTitle}`)}</p>
    <p><strong>Участники.</strong> ${formatRichText(participants)}</p>
    <p><strong>Цель встречи.</strong> ${formatRichText(goal)}</p>
    <p><strong>Ставки и ограничения.</strong> ${formatRichText(stakes)}</p>
    <p><strong>Рабочие заметки.</strong> ${formatRichText(notes)}</p>
  `;

  elements.workspaceForecast.innerHTML = `
    <p class="eyebrow">Прогноз по четырём Яснам</p>
    <h3>${escapeHtml(snapshot.baseShelf.baseName)}: переговорная цепочка</h3>
    <p><strong>Цепочка чтения.</strong> ${escapeHtml(snapshot.atmosphere.title)} → ${escapeHtml(snapshot.cloud.title)} → ${escapeHtml(snapshot.problem.title)} → ${escapeHtml(snapshot.solution.title)}</p>
    <div class="forecast-grid">
      ${forecastMiniCard('Атмосфера', snapshot.atmosphere)}
      ${forecastMiniCard('Облако', snapshot.cloud)}
      ${forecastMiniCard('Проблема', snapshot.problem)}
      ${forecastMiniCard('Управление', snapshot.solution)}
    </div>
    <section class="forecast-callout">
      <h4>Связки текущей полочки</h4>
      <p><strong>Атмосфера → Облако.</strong> ${escapeHtml(snapshot.atmosphereToCloud)}</p>
      <p><strong>Облако → Проблема.</strong> ${escapeHtml(snapshot.cloudToProblem)}</p>
      <p><strong>Проблема → Управление.</strong> ${escapeHtml(snapshot.problemToSolution)}</p>
      <p><strong>Активный режим чтения.</strong> ${escapeHtml(activeGuideText)}</p>
      <p><strong>Следующий управленческий ход.</strong> ${escapeHtml(snapshot.solution.management)}</p>
    </section>
  `;

  elements.workspaceOmens.innerHTML = `
    <p class="eyebrow">Приметы и предсказания атмосферы переговоров</p>
    <h3>${escapeHtml(snapshot.baseShelf.baseName)}: метеосводка</h3>
    <p><strong>Примета.</strong> ${escapeHtml(snapshot.forecast.sign)}</p>
    <p><strong>Предсказание.</strong> ${escapeHtml(snapshot.forecast.forecast)}</p>
    <p><strong>Что проверить прямо сейчас.</strong> ${escapeHtml(snapshot.forecast.watch)}</p>
    <div class="tag-row">
      ${tagChip(snapshot.atmosphere.title.toLowerCase())}
      ${tagChip(snapshot.cloud.title.toLowerCase())}
      ${tagChip(snapshot.problem.title.toLowerCase())}
      ${tagChip(snapshot.solution.title.toLowerCase())}
    </div>
  `;
}

function hydrateTemplateOptions() {
  elements.templateSelect.innerHTML = getAllYasnas().map((yasna) => optionTemplate(yasna, state.primaryId)).join('');
}

function hydrateEditShelfOptions() {
  elements.editShelfSelect.innerHTML = BASE_SHELVES.map((baseShelf, index) => `
    <option value="${index}">${index + 1}. ${escapeHtml(baseShelf.baseName)} — ${escapeHtml(baseShelf.stage)}</option>
  `).join('');
}

function optionTemplate(yasna, selectedId) {
  return `<option value="${yasna.id}" ${yasna.id === selectedId ? 'selected' : ''}>${escapeHtml(yasna.title)}</option>`;
}

function fallbackSynthesisTable(primary, secondary) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Полочка</th>
            <th>${escapeHtml(primary.shortTitle)}</th>
            <th>${escapeHtml(secondary.shortTitle)}</th>
          </tr>
        </thead>
        <tbody>
          ${BASE_SHELVES.map((baseShelf, index) => `
            <tr class="${index === state.shelfIndex ? 'is-row-active' : ''}">
              <td>${index + 1}</td>
              <td>${escapeHtml(baseShelf.baseName)}</td>
              <td>${escapeHtml(primary.shelves[index].title)}</td>
              <td>${escapeHtml(secondary.shelves[index].title)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function detailSection({ eyebrow, title, subtitle, essence, signals, management, tags = [], synthesis = '' }) {
  return `
    <section class="detail-block">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="detail-block__subtitle">${escapeHtml(subtitle)}</p>
      <p><strong>Суть.</strong> ${escapeHtml(essence)}</p>
      <p><strong>Сигналы.</strong> ${escapeHtml(signals)}</p>
      <p><strong>Управление.</strong> ${escapeHtml(management)}</p>
      ${synthesis ? `<p><strong>Подсказка.</strong> ${escapeHtml(synthesis)}</p>` : ''}
      <div class="tag-row">${tags.map(tagChip).join('')}</div>
    </section>
  `;
}

function sectionBlock(title, text) {
  return `
    <section class="constructor-section">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(text)}</p>
    </section>
  `;
}

function diagnosticQuestions(baseShelf, primaryShelf, secondaryShelf) {
  if (!secondaryShelf || state.mode === 'single') {
    return `Какие признаки показывают, что полочка «${baseShelf.baseName}» уже активна? Что в сути «${primaryShelf.title}» нужно сделать видимым? Какой управленческий шаг переведёт эту полочку в следующую фазу цикла?`;
  }

  return `Как соотносятся «${primaryShelf.title}» и «${secondaryShelf.title}» на полочке «${baseShelf.baseName}»? Какая связь между внешней формой и внутренней проблемой наиболее заметна? Какой следующий шаг должен связать эти две линии в единую переговорную механику?`;
}

function riskText(primaryShelf, secondaryShelf) {
  const parts = [
    `Риск этой полочки состоит в том, что смысл «${primaryShelf.title}» можно перепутать с соседними фазами цикла и начать действовать слишком рано или слишком поздно.`,
  ];

  if (secondaryShelf && state.mode === 'synthesis') {
    parts.push(`Дополнительный риск синтеза — увидеть красивое соответствие между «${primaryShelf.title}» и «${secondaryShelf.title}», но не проверить, есть ли оно в реальной встрече.`);
  }

  return parts.join(' ');
}

function fireLens(primaryShelf, secondaryShelf) {
  if (!secondaryShelf || state.mode === 'single') {
    return `Огонь на этой полочке показывает уровень нагрева: что уже горит в теме «${primaryShelf.title}», что только тлеет и где опасность перегрева переговоров.`;
  }

  return `Стихия огня помогает увидеть, какая энергия скрыта между «${primaryShelf.title}» и «${secondaryShelf.title}»: это созидательный нагрев, тление недовольства или уже возможная вспышка.`;
}

function getBuiltinYasna(id) {
  return BUILTIN_YASNAS.find((yasna) => yasna.id === id) || null;
}

function getNegotiationSnapshot() {
  const atmosphereYasna = getBuiltinYasna('meeting_atmosphere') || getPrimaryYasna();
  const cloudYasna = getBuiltinYasna('negotiation_clouds') || getPrimaryYasna();
  const problemYasna = getBuiltinYasna('problem_images') || getPrimaryYasna();
  const solutionYasna = getBuiltinYasna('management_winds') || getPrimaryYasna();
  const atmosphereToCloudGuide = getGuide('meeting_atmosphere', 'negotiation_clouds');
  const cloudToProblemGuide = getGuide('negotiation_clouds', 'problem_images');
  const problemToSolutionGuide = getGuide('problem_images', 'management_winds');

  return {
    baseShelf: BASE_SHELVES[state.shelfIndex],
    atmosphere: atmosphereYasna.shelves[state.shelfIndex],
    cloud: cloudYasna.shelves[state.shelfIndex],
    problem: problemYasna.shelves[state.shelfIndex],
    solution: solutionYasna.shelves[state.shelfIndex],
    atmosphereToCloud: atmosphereToCloudGuide?.links?.[state.shelfIndex] || 'Связка атмосферы и облака для этой полочки пока не задана.',
    cloudToProblem: cloudToProblemGuide?.links?.[state.shelfIndex] || 'Связка облака и проблемы для этой полочки пока не задана.',
    problemToSolution: problemToSolutionGuide?.links?.[state.shelfIndex] || 'Связка проблемы и управленческого решения для этой полочки пока не задана.',
    forecast: NEGOTIATION_FORECASTS[state.shelfIndex] || NEGOTIATION_FORECASTS[0],
  };
}

function forecastMiniCard(label, shelf) {
  return `
    <article class="forecast-mini-card">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <h4>${escapeHtml(shelf.title)}</h4>
      <p>${escapeHtml(shelf.essence)}</p>
    </article>
  `;
}

function syncInputValue(element, value) {
  if (!element || document.activeElement === element) return;
  const normalized = String(value || '');
  if (element.value !== normalized) {
    element.value = normalized;
  }
}

function formatRichText(value) {
  return escapeHtml(value).replaceAll('\n', '<br>');
}

function tagChip(tag) {
  return `<span class="tag">${escapeHtml(tag)}</span>`;
}

function getActiveConstructorOptions() {
  return [...elements.constructorOptions.querySelectorAll('input:checked')].map((input) => input.value);
}

function getAllYasnas() {
  return [...BUILTIN_YASNAS, ...state.userYasnas];
}

function getYasnaById(id) {
  return getAllYasnas().find((yasna) => yasna.id === id);
}

function getPrimaryYasna() {
  return getYasnaById(state.primaryId) || BUILTIN_YASNAS[0];
}

function getSecondaryYasna() {
  return getYasnaById(state.secondaryId) || getAllYasnas().find((yasna) => yasna.id !== state.primaryId) || BUILTIN_YASNAS[1];
}

function ensureValidSelection() {
  const yasnas = getAllYasnas();
  if (!yasnas.some((yasna) => yasna.id === state.primaryId)) {
    state.primaryId = yasnas[0].id;
  }

  if (state.primaryId === state.secondaryId || !yasnas.some((yasna) => yasna.id === state.secondaryId)) {
    const alternative = yasnas.find((yasna) => yasna.id !== state.primaryId);
    state.secondaryId = alternative ? alternative.id : state.primaryId;
  }

  if (state.shelfIndex < 0 || state.shelfIndex >= BASE_SHELVES.length) {
    state.shelfIndex = DEFAULT_SELECTION.shelfIndex;
  }

  if (state.editingShelfIndex < 0 || state.editingShelfIndex >= BASE_SHELVES.length) {
    state.editingShelfIndex = state.shelfIndex;
  }

  hydrateTemplateOptions();
}

function getGuide(primaryId, secondaryId) {
  if (!secondaryId) return null;
  const directKey = `${primaryId}__${secondaryId}`;
  const reverseKey = `${secondaryId}__${primaryId}`;
  return SYNTHESIS_GUIDES[directKey] || SYNTHESIS_GUIDES[reverseKey] || null;
}

function createEmptyWorkspaceDraft() {
  return {
    meetingName: '',
    participants: '',
    goal: '',
    stakes: '',
    notes: '',
  };
}

function loadWorkspaceDraft() {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return createEmptyWorkspaceDraft();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyWorkspaceDraft(),
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
    };
  } catch {
    return createEmptyWorkspaceDraft();
  }
}

function persistWorkspaceDraft() {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state.workspace));
}

function loadUserYasnas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidYasnaShape).map(normalizeImportedYasna) : [];
  } catch {
    return [];
  }
}

function persistUserYasnas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userYasnas));
}

function isValidYasnaShape(yasna) {
  return Boolean(
    yasna &&
      yasna.id &&
      yasna.title &&
      yasna.shortTitle &&
      Array.isArray(yasna.shelves) &&
      yasna.shelves.length === 12
  );
}

function dedupeYasnas(yasnas) {
  const seen = new Set();
  return yasnas.filter((yasna) => {
    if (seen.has(yasna.id)) return false;
    seen.add(yasna.id);
    return true;
  });
}

function normalizeImportedYasna(yasna) {
  return {
    ...yasna,
    kind: 'custom',
    category: normalizeText(yasna.category) || 'Пользовательские',
    subtitle: normalizeText(yasna.subtitle),
    description: normalizeText(yasna.description),
    focus: normalizeText(yasna.focus),
    synthesisHint: normalizeText(yasna.synthesisHint) || 'Синтезируйте эту отдельную Ясну с другими, чтобы обнаруживать новые связи между полочками и расширять предметную карту.',
    shelves: yasna.shelves.map((shelf, index) => ({
      title: normalizeText(shelf.title) || BASE_SHELVES[index].baseName,
      essence: normalizeText(shelf.essence) || 'Содержательное описание полочки пока не заполнено.',
      signals: normalizeText(shelf.signals) || 'Сигналы этой полочки пока не заполнены.',
      management: normalizeText(shelf.management) || 'Управленческий приём для этой полочки пока не заполнен.',
      tags: normalizeTags(shelf.tags),
    })),
  };
}

function createCustomYasnaFromTemplate({ title, shortTitle, category, subtitle, description, focus, source, synthesisHint }) {
  return {
    id: createUserId(title),
    kind: 'custom',
    category,
    title,
    shortTitle,
    subtitle,
    description,
    focus,
    synthesisHint,
    shelves: source.shelves.map((shelf, index) => ({
      title: shelf.title,
      essence: shelf.essence,
      signals: shelf.signals,
      management: shelf.management,
      tags: normalizeTags([...(shelf.tags || []), 'пользовательская ясна', BASE_SHELVES[index].baseName.toLowerCase()]),
    })),
  };
}

function duplicateCurrentYasna() {
  const source = getPrimaryYasna();
  const duplicated = createCustomYasnaFromTemplate({
    title: `${source.title} — копия`,
    shortTitle: `${source.shortTitle}*`,
    category: 'Пользовательские',
    subtitle: source.subtitle,
    description: `Отдельная пользовательская копия Ясны «${source.title}» для самостоятельной доработки и синтеза.`,
    focus: source.focus,
    source,
    synthesisHint: source.synthesisHint,
  });

  state.userYasnas.unshift(duplicated);
  persistUserYasnas();
  state.primaryId = duplicated.id;
  state.mode = 'single';
  ensureValidSelection();
  render();
  flashButton(elements.duplicateYasnaBtn, 'Создана копия');
  flashButton(elements.sidebarDuplicateBtn, 'Создана копия');
}

function openEditDialog() {
  const current = getPrimaryYasna();
  if (current.kind !== 'custom') return;

  state.editingYasnaId = current.id;
  state.editingShelfIndex = state.shelfIndex;

  elements.editDialogTitle.textContent = `Редактирование: ${current.title}`;
  elements.editTitle.value = current.title;
  elements.editShortTitle.value = current.shortTitle;
  elements.editCategory.value = current.category || 'Пользовательские';
  elements.editFocus.value = current.focus || '';
  elements.editSubtitle.value = current.subtitle || '';
  elements.editDescription.value = current.description || '';
  elements.editSynthesisHint.value = current.synthesisHint || '';
  elements.editShelfSelect.value = String(state.editingShelfIndex);
  renderEditShelfFields();
  elements.editDialog.showModal();
}

function renderEditShelfFields() {
  const yasna = getEditingYasna();
  if (!yasna) return;

  const baseShelf = BASE_SHELVES[state.editingShelfIndex];
  const shelf = yasna.shelves[state.editingShelfIndex];
  elements.editShelfMeta.innerHTML = `
    <span class="pill">${state.editingShelfIndex + 1}/12</span>
    <span class="pill pill--accent">${escapeHtml(baseShelf.baseName)}</span>
    <span class="pill">${escapeHtml(baseShelf.stage)}</span>
  `;
  elements.editShelfTitle.value = shelf.title;
  elements.editShelfEssence.value = shelf.essence;
  elements.editShelfSignals.value = shelf.signals;
  elements.editShelfManagement.value = shelf.management;
  elements.editShelfTags.value = shelf.tags.join(', ');
}

function saveEditShelfDraft() {
  const yasna = getEditingYasna();
  if (!yasna) return;

  yasna.shelves[state.editingShelfIndex] = {
    ...yasna.shelves[state.editingShelfIndex],
    title: normalizeText(elements.editShelfTitle.value) || yasna.shelves[state.editingShelfIndex].title,
    essence: normalizeText(elements.editShelfEssence.value) || yasna.shelves[state.editingShelfIndex].essence,
    signals: normalizeText(elements.editShelfSignals.value) || yasna.shelves[state.editingShelfIndex].signals,
    management: normalizeText(elements.editShelfManagement.value) || yasna.shelves[state.editingShelfIndex].management,
    tags: normalizeTags(elements.editShelfTags.value.split(',')),
  };
}

function applyEditForm() {
  const yasna = getEditingYasna();
  if (!yasna) return;

  yasna.title = normalizeText(elements.editTitle.value) || yasna.title;
  yasna.shortTitle = normalizeText(elements.editShortTitle.value) || yasna.shortTitle;
  yasna.category = normalizeText(elements.editCategory.value) || 'Пользовательские';
  yasna.focus = normalizeText(elements.editFocus.value);
  yasna.subtitle = normalizeText(elements.editSubtitle.value);
  yasna.description = normalizeText(elements.editDescription.value);
  yasna.synthesisHint = normalizeText(elements.editSynthesisHint.value) || yasna.synthesisHint;

  persistUserYasnas();
  state.primaryId = yasna.id;
  state.shelfIndex = state.editingShelfIndex;
  ensureValidSelection();
}

function getEditingYasna() {
  return state.userYasnas.find((yasna) => yasna.id === state.editingYasnaId) || null;
}

function deleteCurrentYasna() {
  const current = getPrimaryYasna();
  if (current.kind !== 'custom') return;

  state.userYasnas = state.userYasnas.filter((yasna) => yasna.id !== current.id);
  persistUserYasnas();

  const fallback = getAllYasnas().find((yasna) => yasna.id !== current.id) || BUILTIN_YASNAS[0];
  state.primaryId = fallback.id;

  if (state.secondaryId === current.id) {
    const nextSecondary = getAllYasnas().find((yasna) => yasna.id !== state.primaryId) || fallback;
    state.secondaryId = nextSecondary.id;
  }

  if (state.mode === 'synthesis' && state.primaryId === state.secondaryId) {
    state.mode = 'single';
  }

  ensureValidSelection();
  render();
  flashButton(elements.deleteYasnaBtn, 'Удалено');
  flashButton(elements.sidebarDeleteBtn, 'Удалено');
}

function normalizeTags(tags) {
  const values = Array.isArray(tags) ? tags : [tags];
  const cleaned = values
    .flatMap((value) => String(value || '').split(','))
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean);
  return [...new Set(cleaned)];
}

function normalizeText(value) {
  return String(value || '').trim();
}

function createUserId(title) {
  const slug = normalizeText(title)
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'yasna';
  return `custom-${slug}-${Date.now()}`;
}

function flashButton(button, text) {
  if (!button) return;
  const original = button.dataset.originalText || button.textContent;
  button.dataset.originalText = original;
  button.textContent = text;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

function toggleDisabled(button, disabled) {
  if (!button) return;
  button.disabled = disabled;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

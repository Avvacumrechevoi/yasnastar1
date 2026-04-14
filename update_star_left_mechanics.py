from pathlib import Path

path = Path('/home/ubuntu/yasna-interface-mockups/client/src/pages/Star.tsx')
text = path.read_text()


def replace_exact(src: str, old: str, new: str) -> str:
    if old not in src:
        raise SystemExit(f'Exact block not found:\n{old[:160]}')
    return src.replace(old, new, 1)


def replace_section(src: str, start_marker: str, end_marker: str, new_section: str) -> str:
    start = src.index(start_marker)
    end = src.index(end_marker, start)
    return src[:start] + new_section + src[end:]


text = replace_exact(
    text,
    'import { useMemo, useState } from "react";\nimport { Link } from "wouter";\nimport { ArrowLeft, Orbit, RefreshCw, Sparkles } from "lucide-react";\n',
    'import { useMemo, useState } from "react";\nimport { Link } from "wouter";\nimport { ArrowLeft, Orbit, RefreshCw, Sparkles } from "lucide-react";\nimport { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";\n',
)

text = replace_section(
    text,
    'type MechanicId =',
    'type TabMeta = {',
    '''type MechanicId =
  | "support-cross"
  | "love-cross"
  | "faith-cross"
  | "fire-ha"
  | "water-fo"
  | "air-qi"
  | "earth-she"
  | "elements"
  | "oppositions"
  | "axes"
  | "arcs";

type MechanicGroup = "crosses" | "elements" | "relations";

type PranaId = "she" | "fo" | "qi" | "ha";
type CrossId = "support" | "love" | "faith";

type TabMeta = {
''',
)

text = replace_section(
    text,
    'type MechanicMeta = {',
    'type Point = { x: number; y: number };',
    '''type MechanicMeta = {
  id: MechanicId;
  title: string;
  short: string;
  symbol: string;
  group: MechanicGroup;
  accent: string;
  description: string;
  nodes?: number[];
  lines?: [number, number][];
  arcs?: [number, number][];
  copy: Record<TabId, string>;
};

type Point = { x: number; y: number };
''',
)

text = replace_section(
    text,
    'const MECHANICS: MechanicMeta[] = [',
    'const pranaGroups: { prana: PranaId; nodes: number[] }[] = [',
    '''const MECHANICS: MechanicMeta[] = [
  {
    id: "support-cross",
    title: "Крест Опоры",
    short: "0-3-6-9",
    symbol: "⊕",
    group: "crosses",
    accent: "#ffd17b",
    description: "Несущий каркас: нижняя опора, выход, верхняя ясность и закатный разворот собираются в одну ось устойчивости.",
    nodes: [0, 3, 6, 9],
    copy: {
      "water-cycle": "Показывает несущий контур цикла: запас, активный выход, воздушный перенос и возврат к нижней опоре.",
      atmosphere: "Собирает базовый скелет атмосферы: затемнение, проявление, ясность и обратное сгущение.",
      clouds: "Даёт каркас наблюдения: зарождение формы, явное проявление, доминирование и рассеивание облака.",
      cloudiness: "Показывает, как небо проходит от плотной закрытости к ясности и снова начинает затягиваться.",
      rainbow: "Служит рамой спектра: от скрытого набора цвета к пику проявления и обратному гашению.",
      negotiations: "Выявляет несущий цикл переговоров: подготовка, явное открытие, ясный день разговора и итоговый закат позиции.",
      problems: "Помогает увидеть главные фазы проблемы: скрытая зона, явное проявление, пик ясности и тяжёлый выход.",
    },
  },
  {
    id: "love-cross",
    title: "Крест Любви",
    short: "1-4-7-10",
    symbol: "⊕",
    group: "crosses",
    accent: "#87e5ff",
    description: "Тёплый контур включения: прогрев, мягкий набор силы, пик и вечернее выравнивание ситуации.",
    nodes: [1, 4, 7, 10],
    copy: {
      "water-cycle": "Показывает мягкое тепловое движение воды: от первых струй до выравнивания после прохода цикла.",
      atmosphere: "Читает постепенный прогрев поля, локальные вспышки и спокойный выход атмосферы в баланс.",
      clouds: "Даёт траекторию сгущения и расслабления облачной массы без резкой ломаной оси конфликта.",
      cloudiness: "Помогает увидеть плавный набор и спад облачности через тёплый контур наблюдения.",
      rainbow: "Собирает тёплую дугу спектра — от вспышки к мягкому послесвечению.",
      negotiations: "Показывает, как встреча разогревается: контакт, рост вовлечения, пик напряжения и вечернее выравнивание.",
      problems: "Помогает заметить, как проблема набирает тепло, становится острой и затем оставляет остаточное напряжение.",
    },
  },
  {
    id: "faith-cross",
    title: "Крест Веры",
    short: "2-5-8-11",
    symbol: "⊕",
    group: "crosses",
    accent: "#c7a8ff",
    description: "Контур ожидания и доверия: он показывает скрытую логику, в которую система верит до явного результата.",
    nodes: [2, 5, 8, 11],
    copy: {
      "water-cycle": "Открывает невидимый маршрут воды между ожиданием осадков, переносом и возвращением в цикл.",
      atmosphere: "Читает полутоновые состояния атмосферы, когда поле ещё не кричит, но уже смещается.",
      clouds: "Даёт тонкое чтение облаков по признакам ожидания, формы и будущего разворота фронта.",
      cloudiness: "Показывает не пик, а намёки на то, когда облачность соберётся или начнёт расслаиваться.",
      rainbow: "Собирает самые тонкие переходы спектра, где важна не вспышка, а доверие наблюдению.",
      negotiations: "Помогает прочитать ожидания сторон, скрытую веру в исход и неочевидные сигналы до поворота беседы.",
      problems: "Выявляет ранние признаки проблемы, которые ещё не стали явным конфликтом, но уже требуют внимания.",
    },
  },
  {
    id: "fire-ha",
    title: "Огонь ХА",
    short: "3-7-11",
    symbol: "△",
    group: "elements",
    accent: "#ff9c6c",
    description: "Огненный треугольник импульса, вспышки и кульминации: он показывает, где ситуация загорается и требует немедленного чтения.",
    nodes: [3, 7, 11],
    copy: {
      "water-cycle": "Показывает точки нагрева и разряда, где цикл резко ускоряется и переходит в испарение или грозовую активность.",
      atmosphere: "Выделяет вспышки поля, резкие вопросы и участки, где атмосфера становится нервной и электрической.",
      clouds: "Подсвечивает облачные состояния, связанные с ростом, вертикальным развитием и бурным проявлением.",
      cloudiness: "Помогает отличить мягкую облачность от зон, где небо начинает работать на обострение.",
      rainbow: "Показывает самые яркие и напряжённые спектральные акценты, где цвет буквально вспыхивает.",
      negotiations: "Помогает увидеть точки эскалации: открытый тезис, вспышку эмоций и предельный накал разговора.",
      problems: "Выделяет перегрев проблемы и узлы, где сбой уже нельзя держать в фоновом режиме.",
    },
  },
  {
    id: "water-fo",
    title: "Вода ФО",
    short: "1-5-9",
    symbol: "▽",
    group: "elements",
    accent: "#79d8ff",
    description: "Водный треугольник текучести, растворения и стекания: он показывает, куда энергия уходит и где начинается размывание формы.",
    nodes: [1, 5, 9],
    copy: {
      "water-cycle": "Собирает самую текучую часть цикла: стекание, облачное растворение и возврат воды вниз.",
      atmosphere: "Даёт чтение атмосферной мягкости, влажности и размывания контуров поля.",
      clouds: "Помогает увидеть облака как процесс насыщения, перетекания и утяжеления формы.",
      cloudiness: "Показывает, где облачность начинает висеть, растекаться и закрывать небо без вспышки.",
      rainbow: "Собирает влажную, текучую часть спектра — мягкие переливы и растворённые границы цвета.",
      negotiations: "Показывает уступчивость, уход от жёсткого контура и размывание позиции в разговоре.",
      problems: "Выявляет, где проблема течёт вширь, а не бьёт резко: затягивает, размывает, обволакивает.",
    },
  },
  {
    id: "air-qi",
    title: "Воздух ЦИ",
    short: "2-6-10",
    symbol: "△",
    group: "elements",
    accent: "#88a5ff",
    description: "Воздушный треугольник смысла, обзора и распределения: он даёт дистанцию, ясность и интеллектуальную сборку поля.",
    nodes: [2, 6, 10],
    copy: {
      "water-cycle": "Показывает подъём, перенос и обзорную часть цикла, когда вода работает как воздушная система.",
      atmosphere: "Собирает ясность, продуваемость и способность поля быстро менять ракурс без тяжести.",
      clouds: "Помогает прочитать верхние и переходные облачные формы как работу воздуха и распределения слоя.",
      cloudiness: "Даёт чтение окон, просветов и интеллигентной перестройки облачного поля.",
      rainbow: "Показывает лёгкость спектра, прозрачность переходов и воздушную архитектуру цвета.",
      negotiations: "Подсвечивает смысловой слой беседы: аргументацию, обзор, разведение позиций и ясную речь.",
      problems: "Помогает увидеть, где проблема решается через обзор, осмысление и выравнивание структуры.",
    },
  },
  {
    id: "earth-she",
    title: "Земля ШЭ",
    short: "4-8-0",
    symbol: "▽",
    group: "elements",
    accent: "#dcc77f",
    description: "Земной треугольник тяжести, удержания и материальной опоры: он собирает то, что фиксирует ситуацию в форме.",
    nodes: [4, 8, 0],
    copy: {
      "water-cycle": "Выявляет резервуарную, накопительную и приземлённую часть цикла, где вода удерживается в форме.",
      atmosphere: "Показывает плотность, устойчивость и зоны, где поле давит вниз и собирается в тяжёлую массу.",
      clouds: "Помогает увидеть облачные формы, которые держатся как вес, слой и уплотнение.",
      cloudiness: "Подсвечивает устойчивую, неподвижную облачность и инерцию небесного состояния.",
      rainbow: "Даёт опорную часть спектра — цвета, которые заземляют и стабилизируют общую картину.",
      negotiations: "Показывает, где разговор держится на фактах, опоре, ресурсе и материальном основании договорённости.",
      problems: "Выявляет тяжёлую, фиксированную часть проблемы: то, что упирается, давит и не сдвигается само.",
    },
  },
  {
    id: "elements",
    title: "Стихии",
    short: "4 треугольника",
    symbol: "◈",
    group: "elements",
    accent: "#8ef0b8",
    description: "Собирает всю стихийную карту сразу: земля, вода, воздух и огонь становятся полноценной сеткой чтения поля.",
    copy: {
      "water-cycle": "Показывает цикл как взаимодействие четырёх стихий — удержание, текучесть, перенос и нагрев.",
      atmosphere: "Даёт целостную элементную карту атмосферы: что держит поле, что размывает, что продувает и что воспламеняет.",
      clouds: "Позволяет читать облака как стихии, а не только как формы — по их массе, влаге, воздуху и огневому импульсу.",
      cloudiness: "Показывает облачность как баланс стихий, где важно не только количество облаков, но и их качество.",
      rainbow: "Собирает спектр в элементную систему, где каждый цветовой участок получает собственную стихийную роль.",
      negotiations: "Даёт полный обзор переговоров по стихиям: где нужна опора, где текучесть, где смысл и где вспышка.",
      problems: "Позволяет увидеть проблему целиком: что в ней тяжёлое, что размыто, что требует ясности и где уже перегрев.",
    },
  },
  {
    id: "oppositions",
    title: "Противоположности",
    short: "0-6, 1-7, 2-8...",
    symbol: "↔",
    group: "relations",
    accent: "#9eb6ff",
    description: "Соединяет полные зеркальные пары напротив центра и помогает сразу видеть спорящие состояния звезды.",
    lines: [
      [0, 6],
      [1, 7],
      [2, 8],
      [3, 9],
      [4, 10],
      [5, 11],
    ],
    copy: {
      "water-cycle": "Показывает, где цикл поднимается, а где возвращает накопленное вниз через зеркальные фазы.",
      atmosphere: "Раскрывает, какие состояния поля полностью противостоят друг другу по силе и плотности.",
      clouds: "Даёт сопоставление облачных форм по принципу полного контраста и противоположного поведения.",
      cloudiness: "Показывает, какая степень облачности уравновешивается зеркальной точкой по кругу.",
      rainbow: "Собирает спектр в контрастные пары, усиливающие зрительное чтение и напряжение цвета.",
      negotiations: "Позволяет сопоставить скрытый импульс и его открытый антипод в структуре встречи.",
      problems: "Выводит на поверхность зеркальные типы сбоев и помогает видеть противоположную цену ошибки.",
    },
  },
  {
    id: "axes",
    title: "Оси",
    short: "0↕6 и 3↔9",
    symbol: "⊕",
    group: "relations",
    accent: "#6ee7ff",
    description: "Две главные оси — вертикаль роста и горизонталь явного противостояния — собирают быстрый каркас чтения.",
    lines: [
      [0, 6],
      [3, 9],
    ],
    copy: {
      "water-cycle": "Даёт быстрый каркас цикла: подъём из запаса к ясности и резкий горизонтальный разворот режима.",
      atmosphere: "Показывает вертикаль прояснения и горизонталь конфликта, на которых лучше всего читается поле.",
      clouds: "Позволяет сразу увидеть, где облако растёт вверх, а где уходит в явное противостояние формы и распада.",
      cloudiness: "Собирает простую схему: от закрытости к ясности по вертикали и от вспышки к затягиванию по горизонтали.",
      rainbow: "Помогает читать спектр по двум несущим осям — проявление и контраст.",
      negotiations: "Показывает, где беседа растёт к ясности, а где входит в прямое столкновение позиций.",
      problems: "Выделяет две главные траектории: развитие проблемы по вертикали и её открытое столкновение по горизонтали.",
    },
  },
  {
    id: "arcs",
    title: "Дуги",
    short: "4 круговых перехода",
    symbol: "〜",
    group: "relations",
    accent: "#f7c77a",
    description: "Показывает мягкие круговые переходы по периметру звезды и помогает читать не только узлы, но и течение между ними.",
    arcs: [
      [0, 3],
      [3, 6],
      [6, 9],
      [9, 0],
    ],
    copy: {
      "water-cycle": "Дуги раскрывают цикл как непрерывное перетекание, а не как набор отдельных фиксированных точек.",
      atmosphere: "Позволяют читать атмосферу как плавное движение состояний по кругу, где важны переходы, а не только пики.",
      clouds: "Подсвечивают, как облачная картина перетекает между фазами и не обрывается на отдельных формах.",
      cloudiness: "Дают ощущение кругового ритма облачности: от затягивания к просветам и обратно.",
      rainbow: "Собирают спектр в непрерывное свечение, подчёркивая плавность переходов между участками цвета.",
      negotiations: "Помогают увидеть переходы беседы: как тон, давление и смысл двигаются по окружности, а не скачут от точки к точке.",
      problems: "Показывают проблему как процесс течения и накопления переходов, а не только как набор фиксированных кризисов.",
    },
  },
];

const MECHANIC_SECTIONS: { id: MechanicGroup; title: string; description: string }[] = [
  { id: "crosses", title: "Кресты", description: "несущий каркас" },
  { id: "elements", title: "Стихии", description: "треугольники и поле" },
  { id: "relations", title: "Связи", description: "оси, дуги, зеркала" },
];

const pranaGroups: { prana: PranaId; nodes: number[] }[] = [
''',
)

text = replace_section(
    text,
    'const linePath = (from: number, to: number, radius = starRadius) => {',
    'const joinSelectedLabels = (selectedTabs: TabId[], tabMap: Record<TabId, TabMeta>) =>',
    '''const linePath = (from: number, to: number, radius = starRadius) => {
  const fromPoint = toPoint(from, radius);
  const toPointValue = toPoint(to, radius);

  return `M ${fromPoint.x.toFixed(1)} ${fromPoint.y.toFixed(1)} L ${toPointValue.x.toFixed(1)} ${toPointValue.y.toFixed(1)}`;
};

const arcPath = (from: number, to: number, radius = starRadius + 34) => {
  const fromPoint = toPoint(from, radius);
  const toPointValue = toPoint(to, radius);
  const forwardSteps = (to - from + 12) % 12 || 12;
  const largeArcFlag = forwardSteps > 6 ? 1 : 0;

  return `M ${fromPoint.x.toFixed(1)} ${fromPoint.y.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 ${largeArcFlag} 1 ${toPointValue.x.toFixed(1)} ${toPointValue.y.toFixed(1)}`;
};

const joinSelectedLabels = (selectedTabs: TabId[], tabMap: Record<TabId, TabMeta>) =>
''',
)

text = replace_section(
    text,
    'export default function Star() {\n',
    '  return (\n',
    '''export default function Star() {
  const [selectedTabs, setSelectedTabs] = useState<TabId[]>(["water-cycle", "negotiations"]);
  const [activeShelf, setActiveShelf] = useState<number>(0);
  const [hoveredShelf, setHoveredShelf] = useState<number | null>(null);
  const [selectedMechanics, setSelectedMechanics] = useState<MechanicId[]>(["support-cross", "axes"]);

  const tabMap = useMemo(
    () => Object.fromEntries(TAB_GROUPS.map((tab) => [tab.id, tab])) as Record<TabId, TabMeta>,
    [],
  );

  const yasnaTabs = TAB_GROUPS.filter((tab) => tab.category === "yasna");
  const appliedTabs = TAB_GROUPS.filter((tab) => tab.category === "applied");

  const focusedShelfId = hoveredShelf ?? activeShelf;
  const focusedShelf = SHELVES[focusedShelfId];
  const leadTab = tabMap[selectedTabs[0]];
  const selectedTabTitle = joinSelectedLabels(selectedTabs, tabMap);
  const selectedTabDescription = joinSelectedDescriptions(selectedTabs, tabMap);

  const selectedMechanicsData = useMemo(
    () => MECHANICS.filter((mechanic) => selectedMechanics.includes(mechanic.id)),
    [selectedMechanics],
  );

  const selectedMechanicIds = useMemo(() => new Set<MechanicId>(selectedMechanics), [selectedMechanics]);
  const allMechanicsSelected = selectedMechanics.length === MECHANICS.length;

  const selectedMechanicSummary = selectedMechanicsData.length
    ? allMechanicsSelected
      ? "Все механики включены"
      : selectedMechanicsData.length > 3
        ? `${selectedMechanicsData
            .slice(0, 3)
            .map((mechanic) => mechanic.title)
            .join(" · ")} +${selectedMechanicsData.length - 3}`
        : selectedMechanicsData.map((mechanic) => mechanic.title).join(" · ")
    : "Без механик";

  const mechanicNarratives = selectedMechanicsData.map((mechanic) => ({
    id: mechanic.id,
    title: mechanic.title,
    symbol: mechanic.symbol,
    short: mechanic.short,
    accent: mechanic.accent,
    description: mechanic.description,
    text: selectedTabs.map((tabId) => mechanic.copy[tabId]).join(" / "),
  }));

  const polygonLayers = useMemo(() => {
    const layers: { key: string; nodes: number[]; accent: string }[] = [];
    const seen = new Set<string>();

    const pushPolygon = (nodes: number[], accent: string, keyPrefix: string) => {
      const dedupeKey = [...nodes].sort((a, b) => a - b).join("-");
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      layers.push({ key: `${keyPrefix}-${dedupeKey}`, nodes, accent });
    };

    selectedMechanicsData.forEach((mechanic) => {
      if (mechanic.nodes && mechanic.nodes.length > 2) {
        pushPolygon(mechanic.nodes, mechanic.accent, mechanic.id);
      }
    });

    if (selectedMechanicIds.has("elements")) {
      pranaGroups.forEach((group) => {
        pushPolygon(group.nodes, PRANA_ACCENTS[group.prana], `elements-${group.prana}`);
      });
    }

    return layers;
  }, [selectedMechanicsData, selectedMechanicIds]);

  const lineLayers = useMemo(() => {
    const layers: { key: string; from: number; to: number; accent: string }[] = [];
    const seen = new Set<string>();

    const pushLine = (from: number, to: number, accent: string, keyPrefix: string) => {
      const dedupeKey = [Math.min(from, to), Math.max(from, to)].join("-");
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      layers.push({ key: `${keyPrefix}-${dedupeKey}`, from, to, accent });
    };

    selectedMechanicsData.forEach((mechanic) => {
      mechanic.lines?.forEach(([from, to]) => pushLine(from, to, mechanic.accent, mechanic.id));
    });

    return layers;
  }, [selectedMechanicsData]);

  const arcLayers = useMemo(() => {
    const layers: { key: string; from: number; to: number; accent: string }[] = [];
    const seen = new Set<string>();

    const pushArc = (from: number, to: number, accent: string, keyPrefix: string) => {
      const dedupeKey = `${from}-${to}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      layers.push({ key: `${keyPrefix}-${dedupeKey}`, from, to, accent });
    };

    selectedMechanicsData.forEach((mechanic) => {
      mechanic.arcs?.forEach(([from, to]) => pushArc(from, to, mechanic.accent, mechanic.id));
    });

    return layers;
  }, [selectedMechanicsData]);

  const focusTrackSummary = selectedTabs
    .map((tabId) => `${tabMap[tabId].label}: ${TAB_TRACKS[tabId][focusedShelfId]}`)
    .join(" / ");

  const shelfNarrative = `${focusedShelf.title} — полочка ${focusedShelf.id}. ${focusedShelf.subtitle}. Противоположная точка: ${focusedShelf.opposite}.`;

  const selectedNodeSet = useMemo(() => {
    const nodes = new Set<number>();

    polygonLayers.forEach((layer) => {
      layer.nodes.forEach((node) => nodes.add(node));
    });

    lineLayers.forEach((layer) => {
      nodes.add(layer.from);
      nodes.add(layer.to);
    });

    arcLayers.forEach((layer) => {
      nodes.add(layer.from);
      nodes.add(layer.to);
    });

    return nodes;
  }, [polygonLayers, lineLayers, arcLayers]);

  const toggleTab = (tabId: TabId) => {
    setSelectedTabs((current) => {
      if (current.includes(tabId)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== tabId);
      }

      if (current.length >= 2) {
        return [current[current.length - 1], tabId];
      }

      return [...current, tabId];
    });
  };

  const toggleAllMechanics = () => {
    setSelectedMechanics((current) => (current.length === MECHANICS.length ? [] : MECHANICS.map((mechanic) => mechanic.id)));
  };

  const resetState = () => {
    setSelectedTabs(["water-cycle", "negotiations"]);
    setActiveShelf(0);
    setHoveredShelf(null);
    setSelectedMechanics(["support-cross", "axes"]);
  };

  return (
''',
)

text = replace_exact(
    text,
    '          <aside className="flex min-h-0 flex-col gap-2.5 rounded-[28px] border border-white/10 bg-white/6 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">\n',
    '          <aside className="flex min-h-0 flex-col gap-2.5 overflow-y-auto rounded-[28px] border border-white/10 bg-white/6 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">\n',
)

text = replace_exact(
    text,
    '          <aside className="flex min-h-0 flex-col gap-2.5 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,14,27,0.98),rgba(8,10,20,0.98))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">\n',
    '          <aside className="flex min-h-0 flex-col gap-2.5 overflow-y-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,14,27,0.98),rgba(8,10,20,0.98))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">\n',
)

text = replace_exact(
    text,
    '            <div className="rounded-[22px] border border-white/8 bg-black/18 p-3">\n              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">\n                <div>\n                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Механики звезды</p>\n                  <h2 className="font-serif text-base text-white">Кресты, оси и праны</h2>\n                </div>\n                <div className="text-[10px] text-slate-400">Одна активная механика</div>\n              </div>\n              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">\n                {MECHANICS.map((mechanic) => {\n                  const isActive = activeMechanic === mechanic.id;\n                  return (\n                    <button\n                      key={mechanic.id}\n                      type="button"\n                      onClick={() => setActiveMechanic(isActive ? null : mechanic.id)}\n                      className="rounded-[18px] border px-3 py-2 text-left transition duration-300 hover:-translate-y-0.5"\n                      style={{\n                        borderColor: isActive ? `${mechanic.accent}88` : "rgba(255,255,255,0.09)",\n                        background: isActive\n                          ? `linear-gradient(180deg, ${mechanic.accent}20, rgba(8,12,24,0.92))`\n                          : "rgba(255,255,255,0.03)",\n                        boxShadow: isActive ? `0 0 0 1px ${mechanic.accent}36, 0 0 24px ${mechanic.accent}20` : "none",\n                      }}\n                    >\n                      <span className="block text-[13px] font-medium leading-tight text-white">{mechanic.title}</span>\n                      <span className="mt-0.5 block text-[10px] text-slate-400">{mechanic.short}</span>\n                    </button>\n                  );\n                })}\n              </div>\n            </div>\n',
    '''            <div className="rounded-[22px] border border-white/8 bg-black/18 p-3">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Механики звезды</p>
                  <h2 className="font-serif text-base text-white">Кресты, стихии и связи</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">{allMechanicsSelected ? "Все слои включены" : `${selectedMechanics.length} из ${MECHANICS.length}`}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-500">Мультивыбор</div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAllMechanics}
                className="mb-3 flex w-full items-center justify-between rounded-[18px] border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(46,157,195,0.18),rgba(7,11,22,0.96))] px-3 py-2 text-left transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/35"
              >
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/75">Режим слоя</div>
                  <div className="mt-1 text-[13px] font-medium text-white">{allMechanicsSelected ? "Снять все механики" : "Включить все механики"}</div>
                </div>
                <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-100">
                  {allMechanicsSelected ? "11/11" : "Полный обзор"}
                </div>
              </button>

              <div className="space-y-2">
                {MECHANIC_SECTIONS.map((section) => (
                  <div key={section.id} className="rounded-[18px] border border-white/6 bg-white/[0.03] p-2">
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{section.title}</div>
                      <div className="text-[10px] text-slate-500">{section.description}</div>
                    </div>
                    <ToggleGroup
                      type="multiple"
                      value={selectedMechanics}
                      onValueChange={(values) => setSelectedMechanics(values as MechanicId[])}
                      className="grid gap-1.5"
                    >
                      {MECHANICS.filter((mechanic) => mechanic.group === section.id).map((mechanic) => {
                        const isActive = selectedMechanicIds.has(mechanic.id);

                        return (
                          <ToggleGroupItem
                            key={mechanic.id}
                            value={mechanic.id}
                            className="h-auto w-full justify-start whitespace-normal rounded-[16px] border px-2.5 py-2 text-left transition duration-300 hover:-translate-y-0.5"
                            style={{
                              borderColor: isActive ? `${mechanic.accent}88` : "rgba(255,255,255,0.08)",
                              background: isActive
                                ? `linear-gradient(180deg, ${mechanic.accent}20, rgba(8,12,24,0.92))`
                                : "rgba(255,255,255,0.03)",
                              boxShadow: isActive ? `0 0 0 1px ${mechanic.accent}30, 0 0 22px ${mechanic.accent}18` : "none",
                            }}
                          >
                            <div className="flex w-full items-start gap-2.5">
                              <span
                                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold"
                                style={{ borderColor: `${mechanic.accent}55`, background: `${mechanic.accent}18`, color: mechanic.accent }}
                              >
                                {mechanic.symbol}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[12px] font-medium leading-tight text-white">{mechanic.title}</span>
                                  <span className="rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                    {mechanic.short}
                                  </span>
                                </div>
                                <div className="mt-1 text-[10px] leading-snug text-slate-400">{mechanic.description}</div>
                              </div>
                            </div>
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                  </div>
                ))}
              </div>
            </div>
''',
)

text = replace_exact(
    text,
    '''              <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/8 bg-black/18 px-3 py-2 text-[10px] text-slate-300 backdrop-blur-md">
                <div className="min-w-0">
                  <span className="uppercase tracking-[0.24em] text-slate-500">Активная механика</span>
                  <div className="mt-0.5 text-[12px] text-white">{selectedMechanic ? `${selectedMechanic.title} · ${selectedMechanic.short}` : "Без механики"}</div>
                </div>
                <div className="min-w-0 text-right">
                  <span className="uppercase tracking-[0.24em] text-slate-500">Противоположность</span>
                  <div className="mt-0.5 text-[12px] text-white">Полочка {focusedShelf.opposite}</div>
                </div>
              </div>
''',
    '''              <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/8 bg-black/18 px-3 py-2 text-[10px] text-slate-300 backdrop-blur-md">
                <div className="min-w-0">
                  <span className="uppercase tracking-[0.24em] text-slate-500">Активные механики</span>
                  <div className="mt-0.5 text-[12px] text-white">{selectedMechanicSummary}</div>
                </div>
                <div className="min-w-0 text-right">
                  <span className="uppercase tracking-[0.24em] text-slate-500">Противоположность</span>
                  <div className="mt-0.5 text-[12px] text-white">Полочка {focusedShelf.opposite} · {allMechanicsSelected ? "все слои" : `${selectedMechanics.length} слоя`}</div>
                </div>
              </div>
''',
)

text = replace_exact(
    text,
    '                  {selectedMechanic?.id === "pranas" &&\n                    pranaGroups.map((group) => (\n                      <path\n                        key={group.prana}\n                        d={polygonPath(group.nodes, starRadius - 14)}\n                        fill={`${PRANA_ACCENTS[group.prana]}14`}\n                        stroke={PRANA_ACCENTS[group.prana]}\n                        strokeWidth="2"\n                        strokeOpacity="0.9"\n                        filter="url(#glow-soft)"\n                      />\n                    ))}\n\n                  {selectedMechanic?.nodes && selectedMechanic.nodes.length > 2 && (\n                    <>\n                      <path\n                        d={polygonPath(selectedMechanic.nodes)}\n                        fill={`${selectedMechanic.accent}14`}\n                        stroke={selectedMechanic.accent}\n                        strokeWidth="4"\n                        strokeOpacity="0.22"\n                        filter="url(#glow-soft)"\n                      />\n                      <path\n                        d={polygonPath(selectedMechanic.nodes)}\n                        fill="none"\n                        stroke={selectedMechanic.accent}\n                        strokeWidth="1.8"\n                        strokeOpacity="0.95"\n                      />\n                    </>\n                  )}\n\n                  {selectedMechanic?.lines?.map(([from, to], index) => (\n                    <g key={`${selectedMechanic.id}-${from}-${to}-${index}`}>\n                      <path\n                        d={linePath(from, to)}\n                        stroke={selectedMechanic.accent}\n                        strokeWidth="5"\n                        strokeOpacity="0.18"\n                        fill="none"\n                        filter="url(#glow-soft)"\n                      />\n                      <path\n                        d={linePath(from, to)}\n                        stroke={selectedMechanic.accent}\n                        strokeWidth="1.8"\n                        strokeOpacity="0.95"\n                        fill="none"\n                      />\n                    </g>\n                  ))}\n',
    '''                  {polygonLayers.map((layer) => (
                    <g key={layer.key}>
                      <path
                        d={polygonPath(layer.nodes)}
                        fill={`${layer.accent}12`}
                        stroke={layer.accent}
                        strokeWidth="4"
                        strokeOpacity="0.18"
                        filter="url(#glow-soft)"
                      />
                      <path
                        d={polygonPath(layer.nodes)}
                        fill="none"
                        stroke={layer.accent}
                        strokeWidth="1.7"
                        strokeOpacity="0.9"
                      />
                    </g>
                  ))}

                  {lineLayers.map((layer) => (
                    <g key={layer.key}>
                      <path
                        d={linePath(layer.from, layer.to)}
                        stroke={layer.accent}
                        strokeWidth="5"
                        strokeOpacity="0.16"
                        fill="none"
                        filter="url(#glow-soft)"
                      />
                      <path
                        d={linePath(layer.from, layer.to)}
                        stroke={layer.accent}
                        strokeWidth="1.75"
                        strokeOpacity="0.92"
                        fill="none"
                      />
                    </g>
                  ))}

                  {arcLayers.map((layer) => (
                    <g key={layer.key}>
                      <path
                        d={arcPath(layer.from, layer.to)}
                        stroke={layer.accent}
                        strokeWidth="5"
                        strokeOpacity="0.14"
                        fill="none"
                        filter="url(#glow-soft)"
                      />
                      <path
                        d={arcPath(layer.from, layer.to)}
                        stroke={layer.accent}
                        strokeWidth="1.6"
                        strokeOpacity="0.72"
                        strokeDasharray="5 8"
                        fill="none"
                      />
                    </g>
                  ))}
''',
)

text = replace_exact(
    text,
    '            <div className="rounded-[24px] border border-amber-100/12 bg-[linear-gradient(180deg,rgba(33,22,12,0.72),rgba(10,12,22,0.94))] p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.25)]">\n              <div className="flex items-start justify-between gap-2">\n                <div>\n                  <div className="text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Механика</div>\n                  <div className="mt-1.5 font-serif text-lg leading-snug text-white">{selectedMechanic ? selectedMechanic.title : "Механика не выбрана"}</div>\n                </div>\n                {selectedMechanic && (\n                  <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-[10px] text-amber-100">\n                    {selectedMechanic.short}\n                  </span>\n                )}\n              </div>\n              <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Блок механики</div>\n              <div className="mt-1.5 text-xs leading-relaxed text-slate-200">{constructorMechanicDescription}</div>\n            </div>\n',
    '''            <div className="rounded-[24px] border border-amber-100/12 bg-[linear-gradient(180deg,rgba(33,22,12,0.72),rgba(10,12,22,0.94))] p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Механики</div>
                  <div className="mt-1.5 font-serif text-lg leading-snug text-white">{selectedMechanicSummary}</div>
                </div>
                <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-[10px] text-amber-100">
                  {allMechanicsSelected ? "Все" : `${selectedMechanics.length} выбрано`}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedMechanicsData.length > 0 ? (
                  selectedMechanicsData.map((mechanic) => (
                    <span
                      key={mechanic.id}
                      className="rounded-full border px-2.5 py-1 text-[10px] text-white"
                      style={{ borderColor: `${mechanic.accent}55`, background: `${mechanic.accent}16` }}
                    >
                      {mechanic.symbol} {mechanic.title}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] text-slate-300">Слои пока не включены</span>
                )}
              </div>

              <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Блок механик</div>
              <div className="mt-2 max-h-[15rem] space-y-2.5 overflow-y-auto pr-1">
                {mechanicNarratives.length > 0 ? (
                  mechanicNarratives.map((mechanic) => (
                    <div
                      key={mechanic.id}
                      className="rounded-2xl border px-3 py-2"
                      style={{ borderColor: `${mechanic.accent}30`, background: `${mechanic.accent}10` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-medium text-white">{mechanic.symbol} {mechanic.title}</div>
                        <div className="text-[10px] text-slate-300">{mechanic.short}</div>
                      </div>
                      <div className="mt-1 text-[10px] leading-snug text-slate-400">{mechanic.description}</div>
                      <div className="mt-1.5 text-[11px] leading-relaxed text-slate-100">{mechanic.text}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-2 text-xs leading-relaxed text-slate-300">
                    Включите один или несколько слоёв слева, чтобы конструктор собрал сравнительное чтение по всем выбранным механикам.
                  </div>
                )}
              </div>
            </div>
''',
)

text = replace_exact(
    text,
    '            <div className="mt-auto rounded-[24px] border border-white/8 bg-black/18 p-3 text-xs leading-relaxed text-slate-300">\n              Сначала выберите одну или две Ясны, затем при необходимости включите механику. Конструктор справа собирает читаемый шаблон без перегруза, а центральная сцена остаётся основной зоной анализа.\n            </div>\n',
    '            <div className="mt-auto rounded-[24px] border border-white/8 bg-black/18 p-3 text-xs leading-relaxed text-slate-300">\n              Сначала выберите одну или две Ясны, затем включите один или несколько слоёв механик слева. Центральная сцена собирает их одновременно, а конструктор справа раскладывает смысл по каждой выбранной механике без визуального шума.\n            </div>\n',
)

path.write_text(text)
print('Star.tsx updated')

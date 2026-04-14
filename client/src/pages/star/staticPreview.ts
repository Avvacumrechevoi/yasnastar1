import { useEffect, useMemo, useState } from "react";
import type { AnalysisModeId, Mechanic, MechanicGroup, YasnaCatalogData, YasnaComputedState } from "./apiContract";

type StaticLessonPreview = {
  id: string;
  title: string;
  description: string;
  sourceLesson: string;
  sourceFile: string;
  mechanicMentions: string[];
  pointIndex: number | null;
};

type StaticPointView = {
  index: number;
  rawText: string;
  label: string;
  essence: string;
  tooltip: string;
};

type StaticYasnaRecord = {
  id: string;
  family: string;
  title: string;
  lessonCount: number;
  summary: string;
  contextAccent: string;
  mechanics: string[];
  pointsPreview: Array<{ index: number; label: string }>;
  notes: string[];
  lessons: StaticLessonPreview[];
  points: StaticPointView[];
};

type StaticPreviewSnapshot = {
  generatedAt: string;
  defaultYasnaId: string;
  analysisModes: YasnaCatalogData["analysisModes"];
  mechanics: Mechanic[];
  mechanicGroups: MechanicGroup[];
  yasnas: StaticYasnaRecord[];
};

type StaticPreviewState = {
  snapshot: StaticPreviewSnapshot | null;
  isLoading: boolean;
};

type StaticComputeInput = {
  yasnaId?: string | null;
  selectedPoint?: number | null;
  activeMechanicIds?: string[];
  analysisMode?: AnalysisModeId;
  presetId?: string | null;
  secondaryYasnaId?: string | null;
};

const STATIC_PREVIEW_URL = `${import.meta.env.BASE_URL}pages-preview/runtime.json`;

export const STATIC_PREVIEW_MODE = import.meta.env.VITE_STATIC_PREVIEW === "1";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

function getModeTitle(mode: AnalysisModeId) {
  if (mode === "guided") return "Сценарный разбор";
  if (mode === "synthesis") return "Синтез двух Ясн";
  return "Свободное чтение";
}

function getModeSummary(mode: AnalysisModeId, yasna: StaticYasnaRecord, selectedPoint: StaticPointView | null) {
  if (mode === "guided") {
    return selectedPoint
      ? `Статический preview сохраняет акцент на полочке «${selectedPoint.label}» и показывает сценарные опоры вокруг неё.`
      : `Статический preview показывает сценарные опоры для Ясны «${yasna.title}» без серверной генерации.`;
  }

  if (mode === "synthesis") {
    return `Статический preview соединяет основную Ясну «${yasna.title}» со второй картой через готовые смысловые мосты.`;
  }

  return selectedPoint
    ? `Статический preview читает выбранную полочку «${selectedPoint.label}» и связанные механики локально в браузере.`
    : `Статический preview показывает основу Ясны «${yasna.title}» и позволяет просматривать полочки без backend-runtime.`;
}

function getOppositePoint(index: number) {
  return (index + 6) % 12;
}

function pickDefaultMechanics(yasna: StaticYasnaRecord, mechanics: Mechanic[]) {
  const yasnaTokens = new Set(
    yasna.mechanics
      .flatMap((item) => normalizeText(item).split(" "))
      .filter((token) => token.length > 3),
  );

  const matched = mechanics.filter((mechanic) => {
    const haystack = normalizeText(`${mechanic.title} ${mechanic.shortTitle} ${mechanic.description}`);
    return Array.from(yasnaTokens).some((token) => haystack.includes(token));
  });

  return (matched.length > 0 ? matched : mechanics.slice(0, 3)).slice(0, 3);
}

function buildStaticPreset(yasna: StaticYasnaRecord, selectedPoint: StaticPointView | null, index: number) {
  const lead = yasna.notes[index] ?? yasna.summary;
  const question = selectedPoint
    ? `Что означает полочка «${selectedPoint.label}» в текущем переговорном эпизоде?`
    : `Как лучше читать Ясну «${yasna.title}» в текущем разговоре?`;

  return {
    id: `static-${yasna.id}-${index}`,
    title: index === 0 ? "Опорная примета" : index === 1 ? "Риск смещения" : "Следующий ход",
    summary: lead,
    question,
    tone: index === 0 ? "accent" : index === 1 ? "warning" : "calm",
  };
}

function buildCatalogSummary(yasna: StaticYasnaRecord) {
  return {
    id: yasna.id,
    family: yasna.family,
    title: yasna.title,
    lessonCount: yasna.lessonCount,
    summary: yasna.summary,
    contextAccent: yasna.contextAccent,
    mechanics: yasna.mechanics,
    pointsPreview: yasna.pointsPreview,
  };
}

function buildSelectedPointInsights(selectedPoint: StaticPointView | null) {
  if (!selectedPoint) {
    return [];
  }

  return [
    {
      kind: "point",
      title: selectedPoint.label,
      text: selectedPoint.essence,
      tone: "accent",
    },
  ];
}

function buildMechanicInsights(activeMechanics: Mechanic[], selectedPoint: StaticPointView | null) {
  return activeMechanics.slice(0, 2).map((mechanic) => ({
    kind: "mechanic",
    title: mechanic.title,
    text: selectedPoint && mechanic.points.includes(selectedPoint.index)
      ? `Механика подсвечивает выбранную полочку и помогает увидеть её противоположный или поддерживающий ход.`
      : mechanic.description,
    tone: "calm",
  }));
}

function buildLessonFocus(yasna: StaticYasnaRecord, selectedPoint: StaticPointView | null, activeMechanics: Mechanic[]) {
  const matchingLesson =
    yasna.lessons.find((lesson) => selectedPoint !== null && lesson.pointIndex === selectedPoint.index)
    ?? yasna.lessons[0]
    ?? null;

  if (!matchingLesson) {
    return null;
  }

  return {
    pointIndex: selectedPoint?.index ?? matchingLesson.pointIndex ?? null,
    title: matchingLesson.title,
    description: matchingLesson.description,
    mechanicMentions: matchingLesson.mechanicMentions.length > 0
      ? matchingLesson.mechanicMentions
      : activeMechanics.map((mechanic) => mechanic.title),
    sourceLesson: matchingLesson.sourceLesson,
  };
}

function buildLessonPreviews(yasna: StaticYasnaRecord) {
  return yasna.lessons.slice(0, 3).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    sourceLesson: lesson.sourceLesson,
    sourceFile: lesson.sourceFile,
  }));
}

function buildSynthesisBlock(primary: StaticYasnaRecord, secondary: StaticYasnaRecord | null, selectedPoint: StaticPointView | null) {
  if (!secondary) {
    return {
      enabled: false,
      title: "Синтез пока не выбран",
      summary: "Выберите вторую Ясну, чтобы сопоставить две карты и увидеть общие оси напряжения.",
      secondaryYasna: null,
      bridges: [],
      risks: [],
    };
  }

  const primaryPreview = selectedPoint?.label ?? primary.pointsPreview[0]?.label ?? primary.title;
  const secondaryPreview = secondary.pointsPreview[0]?.label ?? secondary.title;

  return {
    enabled: true,
    title: `Связка «${primary.title}» + «${secondary.title}»`,
    summary: `Статический preview соединяет смысл вокруг «${primaryPreview}» с опорой «${secondaryPreview}», чтобы увидеть общую линию переговоров.`,
    secondaryYasna: buildCatalogSummary(secondary),
    bridges: [
      {
        primaryPointIndex: selectedPoint?.index ?? primary.pointsPreview[0]?.index ?? 0,
        secondaryPointIndex: secondary.pointsPreview[0]?.index ?? 0,
        title: "Общий мост",
        description: `Сопоставьте язык основной карты и второй Ясны, чтобы не потерять общий источник напряжения.`,
      },
    ],
    risks: [
      "Статический preview не выполняет серверную глубинную интерпретацию синтеза и показывает только базовые мосты.",
    ],
  };
}

export function buildStaticCatalogData(snapshot: StaticPreviewSnapshot): YasnaCatalogData {
  return {
    defaultYasnaId: snapshot.defaultYasnaId,
    analysisModes: snapshot.analysisModes,
    mechanics: snapshot.mechanics,
    mechanicGroups: snapshot.mechanicGroups,
    yasnas: snapshot.yasnas.map(buildCatalogSummary),
  } as YasnaCatalogData;
}

export function buildStaticComputedState(
  snapshot: StaticPreviewSnapshot,
  input: StaticComputeInput = {},
): YasnaComputedState | null {
  const activeYasna = snapshot.yasnas.find((item) => item.id === (input.yasnaId ?? snapshot.defaultYasnaId)) ?? snapshot.yasnas[0] ?? null;

  if (!activeYasna) {
    return null;
  }

  const selectedPoint = activeYasna.points.find((point) => point.index === input.selectedPoint) ?? null;
  const oppositePoint = selectedPoint
    ? activeYasna.points.find((point) => point.index === getOppositePoint(selectedPoint.index)) ?? null
    : null;
  const activeMechanics = (
    (input.activeMechanicIds?.length ? input.activeMechanicIds.map((mechanicId) => snapshot.mechanics.find((mechanic) => mechanic.id === mechanicId)).filter(Boolean) : pickDefaultMechanics(activeYasna, snapshot.mechanics)) as Mechanic[]
  ).slice(0, 4);
  const latestMechanic = activeMechanics.at(-1) ?? null;
  const selectedPointMechanics = selectedPoint
    ? activeMechanics.filter((mechanic) => mechanic.points.includes(selectedPoint.index))
    : [];
  const highlightedPointIndices = Array.from(
    new Set([
      ...activeMechanics.flatMap((mechanic) => mechanic.points),
      ...(selectedPoint ? [selectedPoint.index] : []),
      ...(oppositePoint ? [oppositePoint.index] : []),
    ]),
  );
  const analysisMode = input.analysisMode ?? "free";
  const presets = [0, 1, 2].map((index) => buildStaticPreset(activeYasna, selectedPoint, index));
  const activePreset = analysisMode === "guided"
    ? presets.find((preset) => preset.id === input.presetId) ?? presets[0] ?? null
    : null;
  const secondaryYasna = analysisMode === "synthesis"
    ? snapshot.yasnas.find((item) => item.id === input.secondaryYasnaId && item.id !== activeYasna.id) ?? snapshot.yasnas.find((item) => item.id !== activeYasna.id) ?? null
    : null;
  const lessonFocus = buildLessonFocus(activeYasna, selectedPoint, activeMechanics);

  return {
    defaultYasnaId: snapshot.defaultYasnaId,
    availableMechanics: snapshot.mechanics,
    mechanicGroups: snapshot.mechanicGroups,
    analysisMode,
    activeYasna,
    activeMechanics,
    latestMechanic,
    selectedPoint,
    oppositePoint,
    selectedPointMechanics,
    highlightedPointIndices,
    negotiation: {
      lens: {
        id: `${activeYasna.id}-${analysisMode}`,
        title: getModeTitle(analysisMode),
        summary: getModeSummary(analysisMode, activeYasna, selectedPoint),
        question: activePreset?.question ?? activeYasna.notes[0] ?? activeYasna.summary,
        defaultMechanicIds: activeMechanics.map((mechanic) => mechanic.id),
      },
      modeSummary: getModeSummary(analysisMode, activeYasna, selectedPoint),
      presets,
      activePreset,
      insights: [
        ...buildSelectedPointInsights(selectedPoint),
        ...buildMechanicInsights(activeMechanics, selectedPoint),
        ...(activePreset
          ? [{ kind: "preset", title: activePreset.title, text: activePreset.summary || activePreset.question, tone: activePreset.tone }]
          : []),
        ...(analysisMode === "synthesis" && secondaryYasna
          ? [{ kind: "synthesis", title: "Связка двух Ясн", text: `Основная карта сопоставляется с «${secondaryYasna.title}» через базовый статический мост.`, tone: "accent" }]
          : []),
      ],
      recommendations: [
        {
          title: selectedPoint ? `Уточните язык полочки «${selectedPoint.label}»` : `Соберите основную примету Ясны «${activeYasna.title}»`,
          description: selectedPoint
            ? `Попросите участников назвать наблюдаемые признаки по этой полочке, не переходя сразу к оценкам.`
            : `Сначала зафиксируйте атмосферу и только потом подключайте дополнительные механики чтения.`,
          reason: activeYasna.notes[0] ?? activeYasna.summary,
          mechanicIds: activeMechanics.map((mechanic) => mechanic.id),
        },
        {
          title: oppositePoint ? `Проверьте противоположную полочку «${oppositePoint.label}»` : "Сверьте карту с другой точкой звезды",
          description: oppositePoint
            ? `Это поможет увидеть, где компенсирующий ход уже намечается, а где напряжение только нарастает.`
            : `Даже в статическом preview полезно сравнить выбранную Ясну с соседней логикой карты.`,
          reason: selectedPoint ? selectedPoint.tooltip : activeYasna.contextAccent,
          mechanicIds: selectedPointMechanics.map((mechanic) => mechanic.id),
        },
      ],
    },
    synthesis: buildSynthesisBlock(activeYasna, secondaryYasna, selectedPoint),
    ui: {
      analysisModes: snapshot.analysisModes,
      emptyStateTitle: "Статический preview GitHub Pages",
      emptyStateDescription: "На GitHub Pages показывается локально собранная версия интерфейса без server runtime и без OAuth-авторизации.",
    },
    inspector: {
      title: selectedPoint ? selectedPoint.label : activeYasna.title,
      subtitle: selectedPoint ? activeYasna.title : activeYasna.family,
      primaryText: selectedPoint?.essence ?? activeYasna.summary,
      contextText: selectedPoint?.tooltip ?? activeYasna.contextAccent,
      selectedPoint,
      oppositePoint,
      lessonFocus,
      lessonPreviews: buildLessonPreviews(activeYasna),
      activeMechanic: latestMechanic
        ? {
            ...latestMechanic,
            contextText: selectedPoint && latestMechanic.points.includes(selectedPoint.index)
              ? `Механика помогает дочитать выбранную полочку в статическом preview.`
              : latestMechanic.description,
          }
        : null,
      activeMechanics: activeMechanics.map((mechanic) => ({
        ...mechanic,
        contextText: selectedPoint && mechanic.points.includes(selectedPoint.index)
          ? `Связана с полочкой «${selectedPoint.label}».`
          : mechanic.description,
      })),
    },
  } as unknown as YasnaComputedState;
}

export function useStaticPreviewSnapshot(enabled: boolean): StaticPreviewState {
  const [state, setState] = useState<StaticPreviewState>({
    snapshot: null,
    isLoading: enabled,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ snapshot: null, isLoading: false });
      return;
    }

    let isCancelled = false;

    setState((current) => ({
      snapshot: current.snapshot,
      isLoading: current.snapshot ? false : true,
    }));

    void fetch(STATIC_PREVIEW_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load static preview: ${response.status}`);
        }

        return response.json() as Promise<StaticPreviewSnapshot>;
      })
      .then((snapshot) => {
        if (!isCancelled) {
          setState({ snapshot, isLoading: false });
        }
      })
      .catch((error) => {
        console.error("[Static Preview]", error);
        if (!isCancelled) {
          setState({ snapshot: null, isLoading: false });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [enabled]);

  return state;
}

export function useStaticCatalogData(enabled: boolean) {
  const { snapshot, isLoading } = useStaticPreviewSnapshot(enabled);

  return useMemo(
    () => ({
      catalogData: snapshot ? buildStaticCatalogData(snapshot) : null,
      snapshot,
      isLoading,
    }),
    [isLoading, snapshot],
  );
}

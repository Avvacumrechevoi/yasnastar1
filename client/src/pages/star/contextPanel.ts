export type ContextPanelLessonFocus = {
  pointIndex?: number | null;
  title?: string | null;
  description?: string | null;
  mechanicMentions?: string[];
  sourceLesson?: string | null;
};

export type ContextPanelLessonPreview = {
  id: string;
  title?: string | null;
  description?: string | null;
  sourceLesson?: string | null;
  sourceFile?: string | null;
};

export type ContextPanelYasna = {
  title: string;
  summary?: string | null;
  notes?: string[];
  mechanics?: string[];
  lessonFocus?: ContextPanelLessonFocus | null;
  lessonPreviews?: ContextPanelLessonPreview[];
};

export type ContextPanelMechanic = {
  id: string;
  title: string;
  description?: string | null;
  contextText?: string | null;
};

export type ContextPanelPoint = {
  index: number;
  title?: string | null;
  text?: string | null;
};

export type ContextPanelInsight = {
  id: string;
  label: string;
  title: string;
  description: string;
  tone?: "neutral" | "accent" | "warning" | "success";
};

export type ContextPanelRecommendation = {
  id: string;
  title: string;
  description: string;
  reason?: string | null;
};

export type ContextPanelSynthesisBridge = {
  id: string;
  title: string;
  description: string;
};

export type ContextPanelSynthesis = {
  enabled: boolean;
  title?: string | null;
  summary?: string | null;
  bridges?: ContextPanelSynthesisBridge[];
  risks?: string[];
};

export type ContextPanelBlock = {
  id: string;
  kind: "yasna" | "note" | "mechanic" | "point" | "insight" | "recommendation" | "synthesis";
  label: string;
  title: string;
  description: string;
  tone?: "neutral" | "accent" | "warning" | "success";
};

export type ContextPanelModel = {
  headerTitle: string;
  headerDescription: string;
  hint: string | null;
  blocks: ContextPanelBlock[];
};

const EMPTY_YASNA_TITLE = "Ясна не выбрана";
const EMPTY_YASNA_DESCRIPTION = "Выберите Ясну сверху, чтобы увидеть её краткое описание.";
const EMPTY_HINT = "Выберите полочку звезды, чтобы справа появился базовый блок точки, а затем добавляйте механики слева для накопительного контекста.";
const MECHANICS_WITHOUT_POINT_HINT = "Сначала выберите полочку звезды, чтобы применить активные механики к конкретной точке и увидеть их отдельными блоками справа.";
const YASNA_LESSON_LABEL = "Урок Ясны";
const YASNA_NOTE_LABEL = "Опора Ясны";
const YASNA_LESSON_TITLE_FALLBACK = "Опора из материалов Ясны";
const YASNA_LESSON_DESCRIPTION_FALLBACK = "Урок помогает увидеть, как выбранная Ясна работает в текущем контексте.";

export function getSingleSentence(text?: string | null, fallback = "") {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  return (match?.[1] ?? normalized).trim();
}

function getLessonSummary(lessonFocus?: ContextPanelLessonFocus | null) {
  if (!lessonFocus) {
    return null;
  }

  const mechanicsSummary = (lessonFocus.mechanicMentions ?? []).map((item) => item.trim()).filter(Boolean);
  const title = getSingleSentence(lessonFocus.title, YASNA_LESSON_TITLE_FALLBACK);
  const description = getSingleSentence(lessonFocus.description, "")
    || (mechanicsSummary.length > 0 ? `Механики урока: ${mechanicsSummary.join(", ")}.` : YASNA_LESSON_DESCRIPTION_FALLBACK);

  if (!title && !description) {
    return null;
  }

  return {
    title: title || YASNA_LESSON_TITLE_FALLBACK,
    description: description || YASNA_LESSON_DESCRIPTION_FALLBACK,
  };
}

function getLessonPreviewDescription(lessonPreview: ContextPanelLessonPreview) {
  const description = getSingleSentence(lessonPreview.description, "");
  const sourceLesson = getSingleSentence(lessonPreview.sourceLesson, "");
  const sourceFile = getSingleSentence(lessonPreview.sourceFile, "");
  const provenance = [
    sourceLesson ? `Опора: ${sourceLesson}` : "",
    sourceFile ? `Источник: ${sourceFile}.` : "",
  ].filter(Boolean).join(" ").trim();

  if (description && provenance) {
    return `${description} ${provenance}`.trim();
  }

  if (description) {
    return description;
  }

  if (provenance) {
    return provenance;
  }

  return YASNA_LESSON_DESCRIPTION_FALLBACK;
}

export function buildContextPanelModel(input: {
  yasna: ContextPanelYasna | null;
  activeMechanics: ContextPanelMechanic[];
  selectedPoint: ContextPanelPoint | null;
  negotiation?: {
    activePreset?: ContextPanelInsight | null;
    insights?: ContextPanelInsight[];
    recommendations?: ContextPanelRecommendation[];
  } | null;
  synthesis?: ContextPanelSynthesis | null;
}): ContextPanelModel {
  const yasnaTitle = input.yasna?.title?.trim() || EMPTY_YASNA_TITLE;
  const yasnaDescription = getSingleSentence(input.yasna?.summary, EMPTY_YASNA_DESCRIPTION);
  const hasSelectedPoint = Boolean(input.selectedPoint);

  const blocks: ContextPanelBlock[] = [];

  if (input.selectedPoint) {
    blocks.push({
      id: `point-${input.selectedPoint.index}`,
      kind: "point",
      label: `Полочка ${input.selectedPoint.index}`,
      title: input.selectedPoint.title?.trim() || "Полочка без названия",
      description: getSingleSentence(input.selectedPoint.text, `Полочка помогает прочитать выбранную Ясну через точку «${input.selectedPoint.title?.trim() || `Полочка ${input.selectedPoint.index}`}».`),
    });

    const lessonPreviews = (input.yasna?.lessonPreviews ?? []).filter((item) => {
      return Boolean(
        getSingleSentence(item.title, "")
        || getSingleSentence(item.description, "")
        || getSingleSentence(item.sourceLesson, "")
        || getSingleSentence(item.sourceFile, ""),
      );
    });
    const noteBlocks = (input.yasna?.notes ?? [])
      .map((note, index) => ({
        id: `note-${index}`,
        kind: "note" as const,
        label: YASNA_NOTE_LABEL,
        title: `Методическая опора ${index + 1}`,
        description: getSingleSentence(note, ""),
      }))
      .filter((note) => Boolean(note.description))
      .slice(0, 2);

    if (lessonPreviews.length > 0) {
      lessonPreviews.forEach((lessonPreview, index) => {
        blocks.push({
          id: `lesson-${lessonPreview.id || index}`,
          kind: "yasna",
          label: YASNA_LESSON_LABEL,
          title: getSingleSentence(lessonPreview.title, YASNA_LESSON_TITLE_FALLBACK),
          description: getLessonPreviewDescription(lessonPreview),
        });
      });
    } else {
      const lessonSummary = getLessonSummary(input.yasna?.lessonFocus);

      if (lessonSummary) {
        blocks.push({
          id: `lesson-${input.yasna?.title ?? "yasna"}`,
          kind: "yasna",
          label: YASNA_LESSON_LABEL,
          title: lessonSummary.title,
          description: lessonSummary.description,
        });
      }
    }

    noteBlocks.forEach((noteBlock) => {
      blocks.push(noteBlock);
    });

    if (input.negotiation?.activePreset) {
      blocks.push({
        id: `preset-${input.negotiation.activePreset.id}`,
        kind: "insight",
        label: input.negotiation.activePreset.label,
        title: input.negotiation.activePreset.title,
        description: getSingleSentence(input.negotiation.activePreset.description, "Сценарный пресет помогает сузить чтение текущей полочки."),
        tone: input.negotiation.activePreset.tone ?? "accent",
      });
    }

    const filteredInsights = (input.negotiation?.insights ?? []).filter((insight) => {
      return !(insight.label === "Полочка" && /^Полочка\s+\d+$/.test(insight.title.trim()));
    });

    filteredInsights.slice(0, 4).forEach((insight) => {
      blocks.push({
        id: `insight-${insight.id}`,
        kind: "insight",
        label: insight.label,
        title: insight.title,
        description: getSingleSentence(insight.description, "Переговорный инсайт помогает уточнить текущее состояние сцены."),
        tone: insight.tone ?? "neutral",
      });
    });

    input.activeMechanics.forEach((mechanic) => {
      blocks.push({
        id: `mechanic-${mechanic.id}`,
        kind: "mechanic",
        label: "Механика",
        title: mechanic.title.trim(),
        description: getSingleSentence(
          mechanic.contextText || mechanic.description,
          `Механика помогает прочитать полочку через логику Ясны «${yasnaTitle}».`,
        ),
      });
    });

    (input.negotiation?.recommendations ?? []).slice(0, 2).forEach((recommendation) => {
      const reason = getSingleSentence(recommendation.reason, "");
      blocks.push({
        id: `recommendation-${recommendation.id}`,
        kind: "recommendation",
        label: "Следующий шаг",
        title: recommendation.title,
        description: reason
          ? `${getSingleSentence(recommendation.description, "") || "Рекомендация помогает перевести чтение в действие."} Основание: ${reason}`
          : getSingleSentence(recommendation.description, "Рекомендация помогает перевести чтение в действие."),
        tone: "success",
      });
    });

    if (input.synthesis?.enabled) {
      if (input.synthesis.title || input.synthesis.summary) {
        blocks.push({
          id: "synthesis-summary",
          kind: "synthesis",
          label: "Синтез Ясен",
          title: getSingleSentence(input.synthesis.title, "Синтез двух Ясен"),
          description: getSingleSentence(input.synthesis.summary, "Вторая Ясна помогает увидеть дополнительный слой смысла для выбранной полочки."),
          tone: "accent",
        });
      }

      (input.synthesis.bridges ?? []).slice(0, 2).forEach((bridge) => {
        blocks.push({
          id: `synthesis-bridge-${bridge.id}`,
          kind: "synthesis",
          label: "Мост между Яснами",
          title: bridge.title,
          description: getSingleSentence(bridge.description, "Мост показывает, как текущая полочка связывается со второй Ясной."),
          tone: "accent",
        });
      });
    }
  }

  const hint = blocks.length > 0
    ? null
    : input.activeMechanics.length > 0 && !hasSelectedPoint
      ? MECHANICS_WITHOUT_POINT_HINT
      : EMPTY_HINT;

  return {
    headerTitle: yasnaTitle,
    headerDescription: yasnaDescription,
    hint,
    blocks,
  };
}

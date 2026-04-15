/*
Design reminder for this file:
The Yasna star must keep the dark atlas-like tone, but the center remains the primary instrument.
The right column is the only inspector: it accumulates the selected Yasna, active mechanics, the chosen shelf and opposite point logic.
Point numbers live in outer badges beyond the circles, while shelf labels sit in external containers with clean guides, stable spacing and safe padding.
Line mechanics must read as real lines, not only as highlighted endpoints.
*/

import React, { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Check, ChevronLeft, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ContextPanelModel } from "./star/contextPanel";
import { useStarWorkspace } from "./star/useStarWorkspace";

type YasnaLesson = {
  file: string;
  lesson: string;
  topics: string;
  point_assignments: string;
  mechanics_mentions: string[];
  interface_notes: string;
};

type YasnaRecord = {
  id: string;
  family: string;
  title: string;
  lesson_count: number;
  summary: string;
  mechanics: string[];
  points: Record<string, string>;
  lessons: YasnaLesson[];
  notes: string[];
};

type MechanicKind = "polygon" | "line" | "arc" | "contrast";

type MechanicCategory = "Кресты" | "Праны" | "Оси" | "Дуги";

type Mechanic = {
  id: string;
  title: string;
  shortTitle: string;
  alias?: string;
  category: MechanicCategory;
  kind: MechanicKind;
  points: number[];
  stroke: string;
  fill: string;
  glow: string;
  description: string;
};

type Point = {
  index: number;
  x: number;
  y: number;
};

type LabelLayout = {
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  align: "left" | "right" | "center";
  maxChars: number;
};

const VIEWBOX_SIZE = 1800;
const CENTER_X = 900;
const CENTER_Y = 900;
const POINT_RADIUS = 608;
const GRID_RADIUS = 578;
const LABEL_BOX_BASE_HEIGHT = 80;
const LABEL_BOX_LINE_HEIGHT = 28;
const LABEL_BOX_VERTICAL_PADDING = 24;
const LABEL_SAFE_MARGIN_X = 24;
const LABEL_SAFE_MARGIN_RIGHT = 24;
const LABEL_SAFE_MARGIN_TOP = 24;
const LABEL_SAFE_MARGIN_BOTTOM = 48;
const POINT_OUTER_RADIUS = 32;
const POINT_SELECTED_RADIUS = 37;
const POINT_INNER_RADIUS = 18;
const POINT_NUMBER_BADGE_RADIUS = POINT_OUTER_RADIUS;
const POINT_NUMBER_BADGE_OFFSET = 0;
const LABEL_NUMBER_BADGE_GAP = 0;
const LABEL_CLEARANCE = 72;
const LABEL_VERTICAL_SHIFT = 86;
const LABEL_BOX_MIN_WIDTH = 188;
const LABEL_BOX_MAX_WIDTH = 356;
const LABEL_BOX_SIDE_ROW_MIN_WIDTH = 138;
const LABEL_BOX_SIDE_ROW_MAX_WIDTH = 168;
const LABEL_BOX_AXIS_SIDE_MIN_WIDTH = 132;
const LABEL_BOX_AXIS_SIDE_MAX_WIDTH = 144;
const LABEL_BOX_HORIZONTAL_PADDING = 72;
const LABEL_BOX_SIDE_ROW_HORIZONTAL_PADDING = 42;
const LABEL_BOX_AXIS_SIDE_HORIZONTAL_PADDING = 30;
const LABEL_BOX_CHAR_WIDTH = 13.5;

const POINT_LABEL_MAX_CHARS: Record<number, number> = {
  0: 18,
  1: 16,
  2: 16,
  3: 15,
  4: 15,
  5: 16,
  6: 18,
  7: 15,
  8: 16,
  9: 15,
  10: 15,
  11: 17,
};

const POINT_LABEL_TANGENT_SHIFTS: Record<number, number> = {
  0: 0,
  1: -18,
  2: -14,
  3: 0,
  4: 14,
  5: 18,
  6: 0,
  7: -18,
  8: -14,
  9: 0,
  10: 14,
  11: 18,
};

const POINT_LABEL_VERTICAL_TWEAKS: Record<number, number> = {
  0: 8,
  1: 12,
  2: 6,
  3: 0,
  4: -6,
  5: -12,
  6: 18,
  7: -12,
  8: -6,
  9: 0,
  10: 6,
  11: 12,
};

const POINT_LABEL_CENTER_SHIFT: Record<number, number> = {
  0: 0,
  6: 0,
};

const POINT_LABEL_SIDE_SHIFT: Record<number, number> = {
  1: 10,
  2: 8,
  3: 28,
  4: 8,
  5: 10,
  7: 10,
  8: 8,
  9: 28,
  10: 8,
  11: 10,
};

const POINT_LABEL_SIDE_ROW_INDICES = new Set([2, 3, 4, 8, 9, 10]);

const POINT_NUMBER_BADGE_TANGENT_SHIFTS: Record<number, number> = {
  3: 0,
  9: 0,
};

const POINT_LABEL_LINES_MAX = 3;
const LONG_TWO_WORD_LABEL_BONUS_CHARS = 2;
const LONG_LABEL_BONUS_THRESHOLD = 13.4;
const LABEL_POINT_SAFE_RADIUS = POINT_SELECTED_RADIUS + 40;
const LABEL_POINT_SAFE_OFFSET = 22;
const LABEL_OUTER_GEOMETRY_GAP = 24;
const LABEL_POINT_EDGE_GAP = 24;
const LABEL_POINT_EDGE_GAP_TOLERANCE = 0.35;
const LABEL_BADGE_DISTANCE_TOLERANCE = 0.35;
const QUERY_CACHE_STALE_MS = 5 * 60 * 1000;
const QUERY_CACHE_GC_MS = 30 * 60 * 1000;

const RIGHT_INSPECTOR_CARD = "rounded-[22px] border border-white/8 bg-black/10 p-3.5";
const RIGHT_INSPECTOR_LABEL = "text-[10px] uppercase tracking-[0.26em] text-white/42";
const RIGHT_INSPECTOR_TEXT = "mt-2 text-[14px] leading-5 text-white";
const RIGHT_INSPECTOR_BODY = "mt-2.5 text-[13px] leading-5 text-white/72";
const RIGHT_INSPECTOR_MUTED = "text-[12px] leading-5 text-white/58";
const RIGHT_INSPECTOR_BADGE =
  "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/52";
const RIGHT_INSPECTOR_ITEM = "rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2";
const RIGHT_INSPECTOR_ITEM_TITLE = "text-[13px] leading-5 text-white";
const RIGHT_INSPECTOR_ITEM_META = "mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40";

const ACTIVE_MECHANIC_LIST = "space-y-2";

const ACTIVE_MECHANIC_DESCRIPTION_MAX = 170;

const RELATION_EMPTY_TEXT = "Сейчас ни одна активная механика не использует эту полочку.";

const OPPOSITION_EMPTY_TEXT = "Включите механику «Противопоставление», чтобы увидеть пару к выбранной полочке.";

const MECHANIC_PANEL_EMPTY_TEXT = "Выберите механику слева, чтобы увидеть короткое пояснение по выбранной полочке.";

const POINT_PANEL_EMPTY_TEXT = "Выберите полочку слева, чтобы увидеть её краткое описание.";

const YASNA_PANEL_EMPTY_TEXT = "Выберите Ясну, чтобы видеть её интерпретацию в правом столбце.";

const RELATION_PANEL_EMPTY_TEXT = "Выберите одну из 12 точек, чтобы увидеть связи этой полочки.";

const LAST_MECHANIC_EMPTY_TEXT = "Пока ни одна механика не включена.";

const LABEL_FONT_SIZE = 20;
const LABEL_LINE_HEIGHT = 24;
const LABEL_TEXT_DY = 6;
const POINT_NUMBER_DY = 6;
const POINT_NUMBER_SIZE = 19;
const POINT_NUMBER_WEIGHT = 800;
const LABEL_RECT_RADIUS = 18;
const LABEL_RECT_FILL = "rgba(4,18,13,0.56)";
const LABEL_RECT_STROKE = "rgba(255,255,255,0.08)";
const LABEL_RECT_ACTIVE_FILL = "rgba(57,217,138,0.12)";
const LABEL_RECT_ACTIVE_STROKE = "rgba(57,217,138,0.42)";
const GUIDE_STROKE = "rgba(255,255,255,0.18)";
const GUIDE_ACTIVE_STROKE = "rgba(57,217,138,0.68)";
const GUIDE_DASH = "3 9";
const GUIDE_ACTIVE_DASH = "5 7";
const GUIDE_WIDTH = 1.3;
const GUIDE_ACTIVE_WIDTH = 2.2;

const CENTER_RING_OUTER = 112;
const CENTER_RING_INNER = 66;
const CENTER_DIAMOND_TOP = 36;
const CENTER_DIAMOND_SIDE = 22;
const CENTER_DIAMOND_BOTTOM = 36;
const CENTER_DIAMOND_LEFT = 22;

const ACTIVE_MECHANIC_LABEL = "Активная механика";
const POINT_RELATIONS_LABEL = "Связи выбранной полочки";
const SELECTED_POINT_LABEL = "Выбранная полочка";
const OPPOSITION_PANEL_LABEL = "Противопоставление";
const LAST_MECHANIC_LABEL = "Последнее добавление";
const ACTIVE_LIST_LABEL = "Выбранные механики";
const INCLUDES_LABEL = "Входит в";
const OPPOSITE_LABEL = "Противоположная полочка";
const POINT_SUMMARY_FALLBACK = "Полочка не заполнена";
const POINT_TITLE_FALLBACK = "Точка не выбрана";
const NO_YASNA_TITLE = "Не выбрана";
const POINT_TOOLTIP_FALLBACK = "Точка";
const OPPOSITION_HIGHLIGHT_TITLE = "Связь построена по противоположной точке луча.";
const POINT_LABEL_PREFIX = "Полочка";
const YASNA_META_SEPARATOR = " · ";
const RELATION_SEPARATOR = " · ";
const PANEL_SPACING = "space-y-3";
const ACTIVE_MECHANIC_DOT = "mt-1 h-2.5 w-2.5 shrink-0 rounded-full";
const POINT_RELATION_PILL = "rounded-[16px] border border-[#c792ff]/18 bg-[#c792ff]/[0.05] px-3 py-2 text-[13px] leading-5 text-white/82";
const POINT_RELATION_PILL_LABEL = "text-[#d5b7ff]";
const YASNA_META_CLASS = "mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8ab79f]";
const ACTIVE_MECHANIC_HEAD = "flex items-center justify-between gap-3";
const ACTIVE_MECHANIC_ROW = "flex items-start gap-2.5";
const ACTIVE_MECHANIC_ITEMS_WRAPPER = "mt-3 space-y-2";
const POINT_RELATION_WRAPPER = "mt-3 space-y-3 text-[13px] leading-5 text-white/78";
const SIDE_COLUMN_SCROLL = "yasna-scroll flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-2.5 backdrop-blur-xl lg:h-full lg:overflow-y-auto lg:overscroll-contain";
const RIGHT_COLUMN_INNER = "space-y-3";
const ACTIVE_MECHANIC_LATEST = "rounded-[16px] border border-[#39d98a]/18 bg-[#39d98a]/[0.06] px-3 py-2.5";
const ACTIVE_MECHANIC_LATEST_TITLE = "text-[13px] leading-5 text-white";
const ACTIVE_MECHANIC_LATEST_BODY = "mt-1.5 text-[12px] leading-5 text-white/72";
const RELATION_META_LABEL = "text-white/48";
const POINT_CARD_TITLE = "mt-2 text-[15px] leading-5 text-white";
const YASNA_CARD_TITLE = "mt-2 text-[15px] leading-5 text-white";
const PANEL_LIST_TEXT = "mt-3 text-[13px] leading-5 text-white/58";
const ACTIVE_MECHANIC_COUNTER = "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/54";
const MECHANIC_LAST_TEXT = "Последним включением считается последний выбранный пункт из левой колонки.";
const STAR_CONTAINER_MAX = "h-full w-full max-h-[min(78svh,1120px)] max-w-full lg:w-auto lg:max-h-[1120px]";
const STAR_SCENE_MIN = "min-h-[72svh] sm:min-h-[920px]";
const STAR_SCENE_INNER_MIN = "min-h-[68svh] sm:min-h-[900px]";
const STAR_SCENE_PADDING = "px-1.5 py-1.5 sm:px-2.5 sm:py-2.5";
const GRID_TEMPLATE = "mt-4 grid min-h-0 flex-1 grid-cols-1 gap-2 lg:h-[calc(100vh-9.5rem)] lg:max-h-[calc(100vh-9.5rem)] lg:min-h-0 lg:grid-cols-[108px_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden xl:grid-cols-[116px_minmax(0,1fr)] 2xl:grid-cols-[124px_minmax(0,1fr)]";
const SIDE_COLUMN_DESKTOP_LAYOUT = "lg:h-full lg:max-h-full lg:self-stretch lg:overflow-y-auto lg:overscroll-contain";
const CENTER_COLUMN_DESKTOP_LAYOUT = "lg:h-full lg:min-h-0 lg:self-stretch";
const RIGHT_PANEL_COUNT_SUFFIX = "активно";
const POINT_RELATIONS_INACTIVE = RELATION_EMPTY_TEXT;
const ACTIVE_MECHANIC_SUMMARY_PREFIX = "Категория";
const ACTIVE_MECHANIC_DESCRIPTION_PREFIX = "Смысл";
const RIGHT_PANEL_SMALL_GAP = "mt-3";
const ACTIVE_MECHANIC_BADGE_META = "text-[10px] uppercase tracking-[0.18em] text-white/42";
const OPPOSITE_POINT_PREFIX = "полочка";
const ACTIVE_MECHANIC_EMPTY_COUNT = "0";
const RELATION_PANEL_TITLE = "Показывает, где выбранная полочка участвует в активных фигурах, осях и дугах.";
const SELECTED_POINT_PANEL_TITLE = "Краткое содержание выбранной полочки. Полный текст хранится в подсказке по наведению.";
const ACTIVE_MECHANIC_PANEL_TITLE = "Накопительный список выбранных механик и последнего добавления.";
const OPPOSITION_PANEL_TITLE = "Пара по противоположной точке луча для текущей полочки.";
const POINT_LABEL_LAYOUT_TITLE = "Радиально рассчитанная раскладка подписей: подпись вынесена за пределы точки и связана с ней направляющей.";
const POINT_LIST_SEPARATOR = " · ";
const OPPOSITE_FALLBACK = "—";
const ACTIVE_MECHANIC_META_SEPARATOR = " · ";
const SELECTED_POINT_META_SEPARATOR = " · ";
const ACTIVE_MECHANIC_DESCRIPTION_LABEL = "Описание";
const ACTIVE_PANEL_EMPTY_HELP = "Выберите хотя бы одну механику в левой колонке.";
const STAR_GUIDE_GAP = 10;
const POINT_OUTER_STROKE = "rgba(255,255,255,0.68)";
const POINT_OUTER_STROKE_DIM = "rgba(255,255,255,0.24)";
const POINT_OUTER_FILL_DIM = "rgba(255,255,255,0.04)";
const POINT_OUTER_FILL_DEFAULT = "rgba(255,255,255,0.08)";
const POINT_OUTER_FILL_HIGHLIGHT = "rgba(255,255,255,0.16)";
const POINT_OUTER_FILL_ACTIVE = "rgba(57,217,138,0.3)";
const POINT_INNER_FILL = "rgba(4,18,13,0.88)";
const POINT_INNER_FILL_ACTIVE = "rgba(57,217,138,0.94)";
const POINT_NUMBER_BADGE_FILL = "transparent";
const POINT_NUMBER_BADGE_FILL_ACTIVE = "transparent";
const POINT_NUMBER_BADGE_STROKE = "transparent";
const POINT_NUMBER_BADGE_STROKE_ACTIVE = "transparent";
const POINT_NUMBER_FILL = "rgba(255,255,255,0.96)";
const POINT_NUMBER_FILL_ACTIVE = "#04120d";
const ACTIVE_MECHANIC_DESCRIPTION_FALLBACK = "Выберите механику слева, чтобы здесь появилась краткая интерпретация последнего добавления.";
const ACTIVE_MECHANIC_ITEMS_HEADER = "mt-3 space-y-2";
const OPPOSITION_DISABLED_TEXT = "Для построения пары нужна одновременно выбранная полочка и включённая механика «Противопоставление».";
const PANEL_TITLE_LINE_CLASS = "mt-2 text-[15px] leading-5 text-white";
const PANEL_BODY_LINE_CLASS = "mt-2.5 text-[13px] leading-5 text-white/72";
const PANEL_ITEM_BODY_CLASS = "mt-1.5 text-[12px] leading-5 text-white/72";
const DESKTOP_OVERLAY_OFFSET = 20;
const DESKTOP_OVERLAY_MIN_WIDTH = 360;
const DESKTOP_OVERLAY_MIN_HEIGHT = 280;
function polarPoint(index: number, radius: number): Point {
  const angle = ((90 + index * 30) * Math.PI) / 180;

  return {
    index,
    x: CENTER_X + Math.cos(angle) * radius,
    y: CENTER_Y + Math.sin(angle) * radius,
  };
}

function getPolygonPath(points: Point[]): string {
  return points.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ") + " Z";
}

function getOpenPath(points: Point[]): string {
  return points.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function getMechanicPoints(mechanic: Mechanic, pointMap: Point[]) {
  return mechanic.points.map((pointIndex) => pointMap[pointIndex]);
}

function getMechanicPath(mechanic: Mechanic, pointMap: Point[]) {
  const mechanicPoints = getMechanicPoints(mechanic, pointMap);
  return mechanic.kind === "polygon" ? getPolygonPath(mechanicPoints) : getOpenPath(mechanicPoints);
}

function getCentroid(points: Point[]) {
  const total = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function getLineMidpoint(points: Point[]) {
  return {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2,
  };
}

function getMechanicBadgePosition(mechanic: Mechanic, pointMap: Point[]) {
  const mechanicPoints = getMechanicPoints(mechanic, pointMap);

  if (mechanic.kind === "line") {
    return getLineMidpoint(mechanicPoints);
  }

  if (mechanic.kind === "arc") {
    return mechanicPoints[Math.floor(mechanicPoints.length / 2)];
  }

  return getCentroid(mechanicPoints);
}

function normalizeInlineText(text?: string | null) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

function getTooltipText(...parts: Array<string | null | undefined>) {
  return parts
    .map((part) => normalizeInlineText(part))
    .filter(Boolean)
    .join("\n\n");
}

function getPointSegments(text?: string | null) {
  return normalizeInlineText(text)
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function normalizePointLabelCandidate(source: string) {
  return source
    .replace(/\([^)]*\)/g, " ")
    .replace(/[—–-].*$/, " ")
    .replace(/[«»"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPointLabel(text?: string | null) {
  const segments = getPointSegments(text);
  const primary = segments[0] || "";
  const candidates = primary
    .split(/[;,/]/)
    .map((candidate) => normalizePointLabelCandidate(candidate))
    .filter(Boolean);

  const preferred = [...candidates].sort((left, right) => {
    const leftWordCount = left.split(" ").filter(Boolean).length;
    const rightWordCount = right.split(" ").filter(Boolean).length;

    if (leftWordCount !== rightWordCount) {
      return leftWordCount - rightWordCount;
    }

    if (left.length !== right.length) {
      return left.length - right.length;
    }

    return candidates.indexOf(left) - candidates.indexOf(right);
  })[0];

  if (!preferred) {
    return primary || "Полочка не заполнена";
  }

  const words = preferred.split(" ").filter(Boolean);
  const compact = words.length <= 2 ? preferred : words.slice(0, 2).join(" ");
  return `${compact.slice(0, 1).toUpperCase()}${compact.slice(1)}`;
}

function getPointEssence(text?: string | null) {
  const segments = getPointSegments(text);
  const candidate = segments[1] || segments[0] || "";
  return truncate(candidate.replace(/;\s*/g, " · "), 220);
}

function getPointTooltip(text?: string | null) {
  return getPointSegments(text).join("\n");
}

type StarPointLabelOverlayProps = {
  pointIndex: number;
  labelLines: string[];
  tooltip: string;
  isSelected: boolean;
  hasYasnaData: boolean;
  alignClass: string;
  style: CSSProperties;
  onSelect?: () => void;
};

function StarPointLabelOverlay({
  pointIndex,
  labelLines,
  tooltip,
  isSelected,
  hasYasnaData,
  alignClass,
  style,
  onSelect,
}: StarPointLabelOverlayProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={tooltip || `${POINT_TOOLTIP_FALLBACK} ${pointIndex}`}
      className={`absolute z-[3] flex font-semibold tracking-[0.01em] transition ${
        isSelected
          ? "text-white"
          : hasYasnaData
            ? "text-white/92 hover:text-white"
            : "text-white/58"
      }`}
      style={style}
    >
      <span className={`flex min-w-0 w-full flex-col justify-center gap-1 ${alignClass}`}>
        {labelLines.map((line, lineIndex) => (
          <span key={`${pointIndex}-${lineIndex}`}>{line}</span>
        ))}
      </span>
    </button>
  );
}

function getStarLayoutClasses() {
  return {
    containerMax: STAR_CONTAINER_MAX,
    sceneMin: STAR_SCENE_MIN,
    sceneInnerMin: STAR_SCENE_INNER_MIN,
    scenePadding: STAR_SCENE_PADDING,
    gridTemplate: GRID_TEMPLATE,
    sideColumnDesktopLayout: SIDE_COLUMN_DESKTOP_LAYOUT,
    centerColumnDesktopLayout: CENTER_COLUMN_DESKTOP_LAYOUT,
  };
}

function getMechanicContextText(
  mechanic: Mechanic | null,
  selectedPoint: number | null,
  oppositePointIndex: number | null,
  oppositePointLabel: string,
) {
  if (!mechanic) {
    return "";
  }

  if (selectedPoint === null) {
    return "Выберите полочку слева, чтобы увидеть, как эта механика работает в конкретной точке.";
  }

  if (mechanic.kind === "contrast") {
    if (oppositePointIndex !== null) {
      return `На этой полочке механика связывает выбранную точку с противоположной полочкой ${oppositePointIndex} — ${oppositePointLabel}.`;
    }

    return "На этой полочке механика показывает связь с противоположной точкой луча.";
  }

  const baseDescription = truncate(mechanic.description, 180);

  if (mechanic.points.includes(selectedPoint)) {
    return `На этой полочке механика проходит через выбранную точку. ${baseDescription}`;
  }

  return `Механика сейчас включена слева, но выбранная полочка не входит в её контур. ${baseDescription}`;
}

function getPointLabelMaxChars(index: number, text?: string | null) {
  const baseMaxChars = POINT_LABEL_MAX_CHARS[index] ?? 16;
  const label = getPointLabel(text);
  const words = label.split(/\s+/).filter(Boolean);
  const visualUnits = getPointLabelVisualUnits(label);

  if (words.length === 2 && visualUnits >= LONG_LABEL_BONUS_THRESHOLD) {
    return baseMaxChars + LONG_TWO_WORD_LABEL_BONUS_CHARS;
  }

  return baseMaxChars;
}

function getPointLabelLines(text: string | null | undefined, maxChars = 16, maxLines = 2) {
  const label = getPointLabel(text);
  const words = label.split(/\s+/).filter(Boolean);
  const normalizedMaxChars = Math.max(maxChars, 13);
  const maxLineUnits = Math.max(normalizedMaxChars * 0.88, 10.8);

  if (!label) {
    return [""];
  }

  if (getPointLabelVisualUnits(label) <= maxLineUnits + 1.2) {
    return [label];
  }

  if (words.length === 1) {
    return [truncate(label, normalizedMaxChars + 8)];
  }

  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    const candidateUnits = getPointLabelVisualUnits(candidate);

    if (!current || candidateUnits <= maxLineUnits) {
      current = candidate;
      return;
    }

    lines.push(current);
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  if (!lines.length) {
    return [label];
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const trimmed = lines.slice(0, maxLines - 1);
  trimmed.push(truncate(lines.slice(maxLines - 1).join(" "), normalizedMaxChars + 10));
  return trimmed;
}

function getPointLabelVisualUnits(line: string) {
  return normalizeInlineText(line).split("").reduce((sum, char) => {
    if (char === " ") {
      return sum + 0.5;
    }

    if (/[ЩШЖМЮЫФБД]/i.test(char)) {
      return sum + 1.08;
    }

    if (/[ГЗПРУХЧЭЯ]/i.test(char)) {
      return sum + 0.96;
    }

    if (/[1Iil]/.test(char)) {
      return sum + 0.58;
    }

    return sum + 0.84;
  }, 0);
}

function getPointLabelBoxWidth(text: string | null | undefined, maxChars = 16, index?: number) {
  const label = getPointLabel(text);
  const labelLines = getPointLabelLines(label, maxChars, POINT_LABEL_LINES_MAX);
  const isSideRowLabel = index !== undefined && POINT_LABEL_SIDE_ROW_INDICES.has(index);
  const isAxisSideLabel = index === 3 || index === 9;
  const longestLineUnits = labelLines.reduce((max, line) => Math.max(max, getPointLabelVisualUnits(line)), 0);
  const words = label.split(/\s+/).filter(Boolean);
  const hasRoomyLongTwoWordLabel =
    labelLines.length === 1 && words.length === 2 && getPointLabelVisualUnits(label) >= LONG_LABEL_BONUS_THRESHOLD;
  const reservedUnits = labelLines.length === 1 ? (hasRoomyLongTwoWordLabel ? 3.45 : 2.9) : 2.45;

  const horizontalPadding = isAxisSideLabel
    ? LABEL_BOX_AXIS_SIDE_HORIZONTAL_PADDING
    : isSideRowLabel
      ? LABEL_BOX_SIDE_ROW_HORIZONTAL_PADDING
      : LABEL_BOX_HORIZONTAL_PADDING;
  const minWidth = isAxisSideLabel
    ? LABEL_BOX_AXIS_SIDE_MIN_WIDTH
    : isSideRowLabel
      ? LABEL_BOX_SIDE_ROW_MIN_WIDTH
      : LABEL_BOX_MIN_WIDTH;
  const maxWidth = isAxisSideLabel
    ? LABEL_BOX_AXIS_SIDE_MAX_WIDTH
    : isSideRowLabel
      ? LABEL_BOX_SIDE_ROW_MAX_WIDTH
      : LABEL_BOX_MAX_WIDTH;

  return clamp(
    horizontalPadding + (longestLineUnits + reservedUnits) * LABEL_BOX_CHAR_WIDTH,
    minWidth,
    maxWidth,
  );
}

function getPointLabelBoxHeight(text: string | null | undefined, maxChars = 16) {
  const labelLines = getPointLabelLines(text, maxChars, POINT_LABEL_LINES_MAX);
  const extraLines = Math.max(0, labelLines.length - 1);

  return LABEL_BOX_BASE_HEIGHT + extraLines * LABEL_BOX_LINE_HEIGHT + Math.max(0, extraLines - 1) * 4;
}

function getOppositePoint(index: number) {
  return (index + 6) % 12;
}

function getPointLabelLayout(point: Point, text?: string | null): LabelLayout {
  const dx = point.x - CENTER_X;
  const dy = point.y - CENTER_Y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const tx = -uy;
  const ty = ux;
  const maxChars = getPointLabelMaxChars(point.index, text);
  const boxWidth = getPointLabelBoxWidth(text, maxChars, point.index);
  const boxHeight = getPointLabelBoxHeight(text, maxChars);
  const tangentShift = POINT_LABEL_TANGENT_SHIFTS[point.index] ?? 0;
  const verticalTweak = POINT_LABEL_VERTICAL_TWEAKS[point.index] ?? 0;

  if (Math.abs(ux) < 0.12) {
    const boxCenterX = CENTER_X + (POINT_LABEL_CENTER_SHIFT[point.index] ?? 0);
    const boxCenterY =
      point.y + uy * (POINT_OUTER_RADIUS + boxHeight / 2 + LABEL_VERTICAL_SHIFT) + tx * tangentShift + verticalTweak;

    return {
      boxX: boxCenterX,
      boxY: boxCenterY - boxHeight / 2,
      boxWidth,
      boxHeight,
      align: "center",
      maxChars,
    };
  }

  const sideShift = POINT_LABEL_SIDE_SHIFT[point.index] ?? 0;
  const boxCenterX = point.x + ux * (POINT_OUTER_RADIUS + boxWidth / 2 + LABEL_CLEARANCE + sideShift) + tx * tangentShift;

  if (POINT_LABEL_SIDE_ROW_INDICES.has(point.index)) {
    const sideRowCenterY = point.y + verticalTweak;

    if (ux > 0) {
      return {
        boxX: boxCenterX - boxWidth / 2,
        boxY: sideRowCenterY - boxHeight / 2,
        boxWidth,
        boxHeight,
        align: "left",
        maxChars,
      };
    }

    return {
      boxX: boxCenterX + boxWidth / 2,
      boxY: sideRowCenterY - boxHeight / 2,
      boxWidth,
      boxHeight,
      align: "right",
      maxChars,
    };
  }

  const boxCenterY = point.y + uy * (boxHeight / 2 + LABEL_VERTICAL_SHIFT) + ty * tangentShift + verticalTweak;

  if (ux > 0) {
    return {
      boxX: boxCenterX - boxWidth / 2,
      boxY: boxCenterY - boxHeight / 2,
      boxWidth,
      boxHeight,
      align: "left",
      maxChars,
    };
  }

  return {
    boxX: boxCenterX + boxWidth / 2,
    boxY: boxCenterY - boxHeight / 2,
    boxWidth,
    boxHeight,
    align: "right",
    maxChars,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getOverlayBounds(container: HTMLDivElement | null) {
  if (!container) {
    return {
      width: typeof window === "undefined" ? 0 : window.innerWidth,
      height: typeof window === "undefined" ? 0 : window.innerHeight,
    };
  }

  return {
    width: container.clientWidth,
    height: container.clientHeight,
  };
}

function clampOverlaySize(
  size: { width: number; height: number },
  container: HTMLDivElement | null,
) {
  const bounds = getOverlayBounds(container);
  const maxWidth = Math.max(300, bounds.width - DESKTOP_OVERLAY_OFFSET * 2);
  const maxHeight = Math.max(220, bounds.height - DESKTOP_OVERLAY_OFFSET * 2);

  return {
    width: clamp(size.width, Math.min(DESKTOP_OVERLAY_MIN_WIDTH, maxWidth), maxWidth),
    height: clamp(size.height, Math.min(DESKTOP_OVERLAY_MIN_HEIGHT, maxHeight), maxHeight),
  };
}

function clampOverlayPosition(
  position: { x: number; y: number },
  size: { width: number; height: number },
  container: HTMLDivElement | null,
) {
  const bounds = getOverlayBounds(container);

  return {
    x: clamp(position.x, 0, Math.max(0, bounds.width - size.width - DESKTOP_OVERLAY_OFFSET)),
    y: clamp(position.y, 0, Math.max(0, bounds.height - size.height - DESKTOP_OVERLAY_OFFSET)),
  };
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener?.("change", update);

    return () => {
      mediaQuery.removeEventListener?.("change", update);
    };
  }, []);

  return prefersReducedMotion;
}

function StrokeDashAnimation({
  from,
  duration,
  disabled,
}: {
  from: number;
  duration: string;
  disabled: boolean;
}) {
  if (disabled) {
    return null;
  }

  return (
    <animate
      attributeName="stroke-dashoffset"
      from={String(from)}
      to="0"
      dur={duration}
      repeatCount="indefinite"
    />
  );
}

function getRectAxisGap(value: number, start: number, size: number) {
  if (value < start) {
    return start - value;
  }

  if (value > start + size) {
    return value - (start + size);
  }

  return 0;
}

function getPointDistanceToRect(point: Point, x: number, y: number, width: number, height: number) {
  const dx = getRectAxisGap(point.x, x, width);
  const dy = getRectAxisGap(point.y, y, height);

  return Math.hypot(dx, dy);
}

function getLabelBox(layout: LabelLayout, point?: Point) {
  const rawX =
    layout.align === "center"
      ? layout.boxX - layout.boxWidth / 2
      : layout.align === "right"
        ? layout.boxX - layout.boxWidth
        : layout.boxX;

  const rawY = layout.boxY;
  const safeRightMargin = layout.align === "left" ? LABEL_SAFE_MARGIN_RIGHT : LABEL_SAFE_MARGIN_X;
  const maxX = Math.max(LABEL_SAFE_MARGIN_X, VIEWBOX_SIZE - layout.boxWidth - safeRightMargin);
  const maxY = VIEWBOX_SIZE - layout.boxHeight - LABEL_SAFE_MARGIN_BOTTOM;
  let x = clamp(rawX, LABEL_SAFE_MARGIN_X, maxX);
  let y = clamp(rawY, LABEL_SAFE_MARGIN_TOP, maxY);

  if (point) {
    const safeDistance = LABEL_POINT_SAFE_RADIUS + LABEL_POINT_SAFE_OFFSET;
    const isHorizontalAxisSideLabel = layout.align !== "center" && Math.abs(point.y - CENTER_Y) < 0.5;
    const isSideRowLabel = layout.align !== "center" && POINT_LABEL_SIDE_ROW_INDICES.has(point.index);
    const moveHorizontallyAway = (direction: "left" | "right") => {
      const dy = getRectAxisGap(point.y, y, layout.boxHeight);
      const requiredDx = Math.sqrt(Math.max(0, safeDistance * safeDistance - dy * dy));
      const targetX = direction === "left" ? point.x - layout.boxWidth - requiredDx : point.x + requiredDx;
      x = clamp(targetX, LABEL_SAFE_MARGIN_X, maxX);
    };
    const moveVerticallyAway = (direction: "up" | "down") => {
      const dx = getRectAxisGap(point.x, x, layout.boxWidth);
      const requiredDy = Math.sqrt(Math.max(0, safeDistance * safeDistance - dx * dx));
      const targetY = direction === "up" ? point.y - layout.boxHeight - requiredDy : point.y + requiredDy;
      y = clamp(targetY, LABEL_SAFE_MARGIN_TOP, maxY);
    };
    const moveBeyondBadgeHorizontally = () => {
      const requiredDistance = POINT_NUMBER_BADGE_RADIUS + LABEL_NUMBER_BADGE_GAP;

      if (layout.align === "right") {
        const badgeTargetX = badge.x - requiredDistance - layout.boxWidth;
        const pointTargetX = point.x - safeDistance - layout.boxWidth;
        const targetX = Math.min(badgeTargetX, pointTargetX);
        x = clamp(Math.min(x, targetX), LABEL_SAFE_MARGIN_X, maxX);
      } else if (layout.align === "left") {
        const badgeTargetX = badge.x + requiredDistance;
        const pointTargetX = point.x + safeDistance;
        const targetX = Math.max(badgeTargetX, pointTargetX);
        x = clamp(Math.max(x, targetX), LABEL_SAFE_MARGIN_X, maxX);
      }
    };

    if (getPointDistanceToRect(point, x, y, layout.boxWidth, layout.boxHeight) < safeDistance) {
      if (layout.align === "center") {
        moveVerticallyAway(point.y <= CENTER_Y ? "up" : "down");
      } else {
        moveHorizontallyAway(layout.align === "left" ? "right" : "left");
      }
    }

    if (getPointDistanceToRect(point, x, y, layout.boxWidth, layout.boxHeight) < safeDistance) {
      if (layout.align === "center") {
        moveHorizontallyAway(point.x < CENTER_X ? "left" : "right");
      } else if (isSideRowLabel) {
        moveHorizontallyAway(layout.align === "left" ? "right" : "left");
      } else {
        moveVerticallyAway(isHorizontalAxisSideLabel ? "down" : point.y <= CENTER_Y ? "up" : "down");
      }
    }

    const radialDx = point.x - CENTER_X;
    const radialDy = point.y - CENTER_Y;
    const radialLength = Math.hypot(radialDx, radialDy) || 1;
    const ux = radialDx / radialLength;
    const uy = radialDy / radialLength;
    const badge = getPointNumberBadgePosition(point);
    const projectOutside = () => {
      const currentCenterX = x + layout.boxWidth / 2;
      const currentCenterY = y + layout.boxHeight / 2;
      const currentProjection = (currentCenterX - point.x) * ux + (currentCenterY - point.y) * uy;
      const requiredProjection =
        Math.abs(ux) * (layout.boxWidth / 2) + Math.abs(uy) * (layout.boxHeight / 2) + LABEL_OUTER_GEOMETRY_GAP;

      if (currentProjection < requiredProjection) {
        const pushOut = requiredProjection - currentProjection;
        x = clamp(x + ux * pushOut, LABEL_SAFE_MARGIN_X, maxX);
        y = clamp(y + uy * pushOut, LABEL_SAFE_MARGIN_TOP, maxY);
      }
    };
    const projectBeyondBadge = () => {
      const currentCenterX = x + layout.boxWidth / 2;
      const currentCenterY = y + layout.boxHeight / 2;
      const currentDistance = getPointDistanceToRect({ x: badge.x, y: badge.y } as Point, x, y, layout.boxWidth, layout.boxHeight);
      const requiredDistance = POINT_NUMBER_BADGE_RADIUS + LABEL_NUMBER_BADGE_GAP;

      if (currentDistance < requiredDistance) {
        if (isSideRowLabel) {
          moveBeyondBadgeHorizontally();
          return;
        }

        const pushDx = currentCenterX - badge.x || ux;
        const pushDy = currentCenterY - badge.y || uy;
        const pushLength = Math.hypot(pushDx, pushDy) || 1;
        const pushOut = requiredDistance - currentDistance;
        x = clamp(x + (pushDx / pushLength) * pushOut, LABEL_SAFE_MARGIN_X, maxX);
        y = clamp(y + (pushDy / pushLength) * pushOut, LABEL_SAFE_MARGIN_TOP, maxY);
      }
    };

    projectOutside();
    projectBeyondBadge();

    if (Math.abs(ux) < 0.12) {
      if (uy < 0) {
        y = clamp(Math.min(y, point.y - layout.boxHeight - LABEL_POINT_EDGE_GAP), LABEL_SAFE_MARGIN_TOP, maxY);
      } else {
        y = clamp(Math.max(y, point.y + LABEL_POINT_EDGE_GAP), LABEL_SAFE_MARGIN_TOP, maxY);
      }
    } else if (ux > 0) {
      x = clamp(Math.max(x, point.x + LABEL_POINT_EDGE_GAP), LABEL_SAFE_MARGIN_X, maxX);
    } else {
      x = clamp(Math.min(x, point.x - layout.boxWidth - LABEL_POINT_EDGE_GAP), LABEL_SAFE_MARGIN_X, maxX);
    }

    projectOutside();
    projectBeyondBadge();
  }

  return {
    x,
    y,
    width: layout.boxWidth,
    height: layout.boxHeight,
  };
}

function getPointLabelCollisionMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const safeDistance = LABEL_POINT_SAFE_RADIUS + LABEL_POINT_SAFE_OFFSET;
  const distance = getPointDistanceToRect(point, box.x, box.y, box.width, box.height);

  return {
    point,
    box,
    safeDistance,
    distance,
  };
}

function getPointLabelSideMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const boxCenterX = box.x + box.width / 2;

  return {
    point,
    box,
    boxCenterX,
    isBoxLeftOfPoint: box.x + box.width <= point.x,
    isBoxRightOfPoint: box.x >= point.x,
    centerDeltaX: boxCenterX - point.x,
  };
}

function getPointLabelOuterSideMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const radialDx = point.x - CENTER_X;
  const radialDy = point.y - CENTER_Y;
  const radialLength = Math.hypot(radialDx, radialDy) || 1;
  const ux = radialDx / radialLength;
  const uy = radialDy / radialLength;
  const boxCenterX = box.x + box.width / 2;
  const boxCenterY = box.y + box.height / 2;
  const projection = (boxCenterX - point.x) * ux + (boxCenterY - point.y) * uy;
  const requiredProjection = Math.abs(ux) * (box.width / 2) + Math.abs(uy) * (box.height / 2) + LABEL_OUTER_GEOMETRY_GAP;

  return {
    point,
    box,
    projection,
    requiredProjection,
    staysOutside: projection >= requiredProjection,
  };
}

function getPointNumberBadgeMetrics(index: number) {
  const point = polarPoint(index, POINT_RADIUS);
  const badge = getPointNumberBadgePosition(point);
  const centerDistance = Math.hypot(badge.x - point.x, badge.y - point.y);
  const innerRoom = POINT_OUTER_RADIUS - centerDistance;

  return {
    point,
    badge,
    centerDistance,
    innerRoom,
    requiredCenterDistance: 0,
    staysInsidePoint: centerDistance <= POINT_OUTER_RADIUS + 0.0001,
    staysCentered: centerDistance <= 0.0001,
  };
}

function getPointLabelBadgeGapMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const badge = getPointNumberBadgePosition(point);
  const distance = getPointDistanceToRect({ x: badge.x, y: badge.y } as Point, box.x, box.y, box.width, box.height);
  const requiredDistance = POINT_NUMBER_BADGE_RADIUS + LABEL_NUMBER_BADGE_GAP - LABEL_BADGE_DISTANCE_TOLERANCE;

  return {
    point,
    badge,
    box,
    distance,
    requiredDistance,
    staysBeyondBadge: distance + 0.0001 >= requiredDistance,
  };
}
function getPointLabelGapMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const radialDx = point.x - CENTER_X;
  const radialDy = point.y - CENTER_Y;
  const radialLength = Math.hypot(radialDx, radialDy) || 1;
  const ux = radialDx / radialLength;
  const uy = radialDy / radialLength;
  const edgeGap =
    Math.abs(ux) < 0.12
      ? uy < 0
        ? point.y - (box.y + box.height)
        : box.y - point.y
      : ux > 0
        ? box.x - point.x
        : point.x - (box.x + box.width);

  return {
    point,
    box,
    edgeGap,
    requiredEdgeGap: LABEL_POINT_EDGE_GAP - LABEL_POINT_EDGE_GAP_TOLERANCE,
    staysBeyondPointEdge: edgeGap >= LABEL_POINT_EDGE_GAP - LABEL_POINT_EDGE_GAP_TOLERANCE,
  };
}

function getPointLabelViewportMetrics(index: number, text?: string | null) {
  const point = polarPoint(index, POINT_RADIUS);
  const layout = getPointLabelLayout(point, text);
  const box = getLabelBox(layout, point);
  const safeRightMargin = layout.align === "left" ? LABEL_SAFE_MARGIN_RIGHT : LABEL_SAFE_MARGIN_X;
  const leftGap = box.x - LABEL_SAFE_MARGIN_X;
  const rightGap = VIEWBOX_SIZE - (box.x + box.width) - safeRightMargin;
  const topGap = box.y - LABEL_SAFE_MARGIN_TOP;
  const bottomGap = VIEWBOX_SIZE - (box.y + box.height) - LABEL_SAFE_MARGIN_BOTTOM;
  const leftBoundaryGap = box.x;
  const rightBoundaryGap = VIEWBOX_SIZE - (box.x + box.width);
  const topBoundaryGap = box.y;
  const bottomBoundaryGap = VIEWBOX_SIZE - (box.y + box.height);

  return {
    point,
    box,
    leftGap,
    rightGap,
    topGap,
    bottomGap,
    leftBoundaryGap,
    rightBoundaryGap,
    topBoundaryGap,
    bottomBoundaryGap,
    keepsInsideViewport:
      leftGap >= -0.0001 && rightGap >= -0.0001 && topGap >= -0.0001 && bottomGap >= -0.0001,
  };
}

function getPointNumberBadgePosition(point: Point) {
  return {
    x: point.x,
    y: point.y,
  };
}

function getGuideTarget(layout: LabelLayout, point?: Point) {
  const box = getLabelBox(layout, point);

  if (!point) {
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  if (layout.align === "left") {
    return { x: box.x, y: box.y + box.height / 2 };
  }

  if (layout.align === "right") {
    return { x: box.x + box.width, y: box.y + box.height / 2 };
  }

  return {
    x: box.x + box.width / 2,
    y: box.y > CENTER_Y ? box.y : box.y + box.height,
  };
}

function getLabelTextAnchor(layout: LabelLayout) {
  if (layout.align === "left") {
    return "start";
  }

  if (layout.align === "right") {
    return "end";
  }

  return "middle";
}

function getLabelTextX(layout: LabelLayout, point?: Point) {
  const box = getLabelBox(layout, point);

  if (layout.align === "left") {
    return box.x + 22;
  }

  if (layout.align === "right") {
    return box.x + box.width - 22;
  }

  return box.x + box.width / 2;
}

function getLeaderStart(point: Point) {
  const dx = point.x - CENTER_X;
  const dy = point.y - CENTER_Y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  return {
    x: point.x + (dx / length) * (POINT_OUTER_RADIUS + STAR_GUIDE_GAP),
    y: point.y + (dy / length) * (POINT_OUTER_RADIUS + STAR_GUIDE_GAP),
  };
}

function getMechanicButtonLabel(mechanic: Pick<Mechanic, "title" | "shortTitle">) {
  return normalizeInlineText(mechanic.shortTitle) || normalizeInlineText(mechanic.title);
}

type StarMechanicListButtonProps = {
  mechanic: Pick<Mechanic, "id" | "title" | "shortTitle" | "stroke" | "glow">;
  isActive: boolean;
  onClick?: () => void;
  tooltip?: string;
};

function StarMechanicListButton({ mechanic, isActive, onClick, tooltip }: StarMechanicListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      aria-pressed={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={`flex w-full items-center justify-between gap-3.5 rounded-[18px] border px-3.5 py-3.5 text-left transition ${
        isActive
          ? "border-[#39d98a]/56 bg-[linear-gradient(180deg,rgba(15,62,38,0.96),rgba(10,38,24,0.96))] text-white shadow-[0_0_0_1px_rgba(57,217,138,0.18),0_16px_42px_rgba(0,0,0,0.24)]"
          : "border-white/8 bg-black/10 text-white/72 hover:border-white/14 hover:bg-white/7 hover:text-white"
      }`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <div className="text-[12px] font-medium leading-[1.3] sm:text-[12.5px]">{getMechanicButtonLabel(mechanic)}</div>
      </div>
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
          isActive ? "border-[#39d98a]/65 bg-[#39d98a] text-[#04120d]" : "border-white/12 bg-white/[0.03] text-transparent"
        }`}
        style={{
          boxShadow: isActive ? `0 0 18px ${mechanic.glow}` : "none",
        }}
      >
        {isActive ? <Check className="h-3.5 w-3.5" /> : <span className="h-2.5 w-2.5 rounded-full" style={{ background: mechanic.stroke }} />}
      </span>
    </button>
  );
}

function getMechanicVisualStyle(mechanic: Pick<Mechanic, "id" | "kind">) {
  if (mechanic.kind === "contrast") {
    return {
      haloWidth: 12,
      coreWidth: 4.4,
      accentWidth: 1.8,
      dashArray: "10 12",
      accentDashArray: "1 21",
      dashOffsetFrom: 110,
      accentDashOffsetFrom: 34,
      animationDuration: "4.8s",
      haloOpacity: 0.14,
      accentOpacity: 0.82,
    };
  }

  if (mechanic.kind === "line") {
    const isHeroLine = mechanic.id === "unity-line" || mechanic.id === "struggle-line";
    const isUnity = mechanic.id === "unity-line";
    const isStruggle = mechanic.id === "struggle-line";

    return {
      haloWidth: isHeroLine ? 18 : 15,
      coreWidth: isHeroLine ? 6.2 : 5.2,
      accentWidth: isHeroLine ? 2.2 : 1.9,
      dashArray: isUnity ? "22 10" : isStruggle ? "6 12" : "10 10",
      accentDashArray: isUnity ? "2 24" : isStruggle ? "1 18" : "1 20",
      dashOffsetFrom: isUnity ? 156 : isStruggle ? 82 : 104,
      accentDashOffsetFrom: isUnity ? 44 : isStruggle ? 28 : 32,
      animationDuration: isUnity ? "4s" : isStruggle ? "2.5s" : "4.8s",
      haloOpacity: isHeroLine ? 0.26 : 0.18,
      accentOpacity: isHeroLine ? 0.92 : 0.8,
    };
  }

  if (mechanic.kind === "arc") {
    return {
      haloWidth: 16,
      coreWidth: 5.8,
      accentWidth: 2.1,
      dashArray: "14 12",
      accentDashArray: "1 18",
      dashOffsetFrom: 96,
      accentDashOffsetFrom: 26,
      animationDuration: "3.6s",
      haloOpacity: 0.22,
      accentOpacity: 0.84,
    };
  }

  return {
    haloWidth: 0,
    coreWidth: 0,
    accentWidth: 0,
    dashArray: "",
    accentDashArray: "",
    dashOffsetFrom: 0,
    accentDashOffsetFrom: 0,
    animationDuration: "0s",
    haloOpacity: 0,
    accentOpacity: 0,
  };
}

type StarContrastOverlayProps = {
  mechanic: Pick<Mechanic, "id" | "title" | "stroke" | "kind">;
  selectedPoint: number | null;
  starPoints: Point[];
  disableMotion?: boolean;
};

function StarContrastOverlay({ mechanic, selectedPoint, starPoints, disableMotion = false }: StarContrastOverlayProps) {
  if (selectedPoint === null) {
    return null;
  }

  const oppositePointIndex = (selectedPoint + 6) % starPoints.length;

  if (oppositePointIndex === selectedPoint) {
    return null;
  }

  const visualStyle = getMechanicVisualStyle(mechanic);
  const from = starPoints[selectedPoint];
  const to = starPoints[oppositePointIndex];
  const badgePosition = {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={mechanic.stroke}
        strokeWidth={visualStyle.haloWidth}
        strokeLinecap="round"
        opacity={visualStyle.haloOpacity}
        filter="url(#star-glow)"
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={mechanic.stroke}
        strokeWidth={visualStyle.coreWidth}
        strokeLinecap="round"
        strokeDasharray={visualStyle.dashArray}
        filter="url(#star-glow)"
      >
        <StrokeDashAnimation
          from={visualStyle.dashOffsetFrom}
          duration={visualStyle.animationDuration}
          disabled={disableMotion}
        />
      </line>
      <g transform={`translate(${badgePosition.x}, ${badgePosition.y - 22})`}>
        <rect x={-74} y={-15} width="148" height="30" rx="15" fill="rgba(4,18,13,0.9)" stroke={mechanic.stroke} strokeWidth="1.1" />
        <text textAnchor="middle" y="6" fill="rgba(255,255,255,0.96)" fontSize="16" letterSpacing="0.12em" fontWeight={700}>
          {mechanic.title}
        </text>
      </g>
    </g>
  );
}

type StarSelectionInsightCardProps = {
  model: ContextPanelModel;
  className?: string;
};

function StarSelectionInsightCard({ model, className }: StarSelectionInsightCardProps) {
  const pointBlock = model.blocks.find((block) => block.kind === "point") ?? null;
  const lessonBlocks = model.blocks.filter((block) => block.kind === "yasna");
  const noteBlocks = model.blocks.filter((block) => block.kind === "note");
  const insightBlocks = model.blocks.filter((block) => block.kind === "insight");
  const mechanicBlocks = model.blocks.filter((block) => block.kind === "mechanic");
  const recommendationBlocks = model.blocks.filter((block) => block.kind === "recommendation");
  const synthesisBlocks = model.blocks.filter((block) => block.kind === "synthesis");

  if (!pointBlock) {
    return null;
  }

  const getToneClassName = (tone?: string) => {
    if (tone === "warning") {
      return "border-amber-400/20 bg-[linear-gradient(180deg,rgba(61,39,12,0.92),rgba(28,18,7,0.94))]";
    }

    if (tone === "success") {
      return "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(10,40,27,0.94),rgba(5,19,13,0.94))]";
    }

    if (tone === "accent") {
      return "border-cyan-300/18 bg-[linear-gradient(180deg,rgba(9,31,37,0.94),rgba(6,18,22,0.95))]";
    }

    return "border-white/10 bg-[linear-gradient(180deg,rgba(18,28,23,0.92),rgba(9,14,12,0.94))]";
  };

  return (
    <section
      className={`rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,24,17,0.94),rgba(5,15,10,0.96))] px-4 py-4 shadow-[0_20px_54px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className ?? ""}`}
      data-testid="star-selection-card"
    >
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-[720px] flex-1">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#8ab79f]">Выбранная полочка</div>
          <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">{pointBlock.title}</h3>
          <p className="mt-2 break-words text-[14px] leading-6 text-white/72">{pointBlock.description}</p>
        </div>

        <div className="min-w-0 rounded-[18px] border border-white/8 bg-white/[0.035] px-3 py-3 text-left lg:w-[320px] lg:max-w-[320px] lg:flex-none">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">Ясна</div>
          <div className="mt-1.5 text-[14px] font-semibold text-white">{model.headerTitle}</div>
          <p className="mt-1.5 break-words text-[12px] leading-[1.5] text-white/60">{model.headerDescription}</p>
        </div>
      </div>

      {lessonBlocks.length > 0 || noteBlocks.length > 0 ? (
        <div className="mt-4 grid gap-2.5 xl:grid-cols-2" data-testid="star-selection-card-yasna-support">
          {lessonBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,23,0.92),rgba(9,14,12,0.94))] px-3.5 py-3"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[12px] leading-[1.55] text-white/70">{block.description}</p>
            </article>
          ))}
          {noteBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[18px] border border-emerald-400/16 bg-[linear-gradient(180deg,rgba(12,37,25,0.9),rgba(6,18,13,0.94))] px-3.5 py-3"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[12px] leading-[1.55] text-white/72">{block.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      {insightBlocks.length > 0 ? (
        <div className="mt-4 grid gap-2.5 xl:grid-cols-2" data-testid="star-selection-card-insights">
          {insightBlocks.map((block) => (
            <article
              key={block.id}
              className={`rounded-[18px] border px-3.5 py-3 ${getToneClassName(block.tone)}`}
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[12px] leading-[1.55] text-white/70">{block.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2.5">
        {mechanicBlocks.length > 0 ? (
          mechanicBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[18px] border border-[#39d98a]/18 bg-[linear-gradient(180deg,rgba(12,37,25,0.94),rgba(6,18,13,0.94))] px-3.5 py-3"
              data-testid="star-selection-card-mechanic"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[13px] leading-[1.55] text-white/72">{block.description}</p>
            </article>
          ))
        ) : (
          <article className="rounded-[18px] border border-dashed border-white/12 bg-white/[0.03] px-3.5 py-3 text-[13px] leading-[1.55] text-white/58">
            Выберите механику слева, и в карточке появится отдельный блок с её названием и пояснением, как она работает для выбранной полочки.
          </article>
        )}
      </div>

      {recommendationBlocks.length > 0 ? (
        <div className="mt-4 space-y-2.5" data-testid="star-selection-card-recommendations">
          {recommendationBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[18px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(10,40,27,0.94),rgba(5,19,13,0.94))] px-3.5 py-3"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[12px] leading-[1.55] text-white/72">{block.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      {synthesisBlocks.length > 0 ? (
        <div className="mt-4 space-y-2.5" data-testid="star-selection-card-synthesis">
          {synthesisBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[18px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(9,31,37,0.94),rgba(6,18,22,0.95))] px-3.5 py-3"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{block.title}</div>
              <p className="mt-1.5 break-words text-[12px] leading-[1.55] text-white/72">{block.description}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function Star() {
  const {
    activeMechanicIds,
    activePresetId,
    activeYasna,
    analysisMode,
    availablePresets,
    catalogAnalysisModes,
    computedState,
    currentYasnaKey,
    contextPanelModel,
    displayMechanics,
    highlightedPoints,
    isCatalogLoading,
    isStateLoading,
    isYasnaLibraryOpen,
    latestMechanic,
    mechanicGroups,
    mechanics,
    mechanicsById,
    oppositePointIndex,
    oppositePointLabel,
    oppositionMechanicActive,
    pointViewsByIndex,
    selectedLibraryYasnaIds,
    selectedLibraryYasnas,
    selectedPoint,
    selectedPointEssence,
    selectedPointLabel,
    selectedPointText,
    selectedPointTooltip,
    setActivePresetId,
    setAnalysisMode,
    setIsYasnaLibraryOpen,
    setSecondaryYasnaId,
    setSelectedLibraryYasnaIds,
    synthesisCandidates,
    toggleAllMechanics,
    toggleMechanic,
    toggleYasnaInLibrary,
    removeYasnaFromLibraryRow,
    selectPoint,
    selectYasna,
    yasnaLibraryPanelCopy,
    yasnas,
    allMechanicsSelected,
  } = useStarWorkspace();

  const starPoints = useMemo(() => Array.from({ length: 12 }, (_, index) => polarPoint(index, POINT_RADIUS)), []);
  const ringPoints = useMemo(() => Array.from({ length: 12 }, (_, index) => polarPoint(index, GRID_RADIUS)), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isOverlayCollapsed, setIsOverlayCollapsed] = useState(false);
  const [overlayDesktopPosition, setOverlayDesktopPosition] = useState<{ x: number; y: number } | null>(null);
  const [overlayDesktopSize, setOverlayDesktopSize] = useState({ width: 512, height: 560 });
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayResizeRef = useRef<HTMLDivElement | null>(null);
  const overlayDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const overlayResizeStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originWidth: number;
    originHeight: number;
  } | null>(null);

  useEffect(() => {
    if (selectedPoint) {
      setIsOverlayCollapsed(false);
    }
  }, [selectedPoint]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncOverlayToBounds = () => {
      setOverlayDesktopSize((currentSize) => {
        const nextSize = clampOverlaySize(currentSize, overlayContainerRef.current);

        setOverlayDesktopPosition((currentPosition) =>
          currentPosition ? clampOverlayPosition(currentPosition, nextSize, overlayContainerRef.current) : currentPosition,
        );

        return nextSize.width === currentSize.width && nextSize.height === currentSize.height ? currentSize : nextSize;
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (overlayDragRef.current) {
        const nextX = overlayDragRef.current.originX + (event.clientX - overlayDragRef.current.startX);
        const nextY = overlayDragRef.current.originY + (event.clientY - overlayDragRef.current.startY);
        setOverlayDesktopPosition(
          clampOverlayPosition({ x: nextX, y: nextY }, overlayDesktopSize, overlayContainerRef.current),
        );
      }

      if (overlayResizeStateRef.current) {
        const nextSize = clampOverlaySize(
          {
            width: overlayResizeStateRef.current.originWidth + (event.clientX - overlayResizeStateRef.current.startX),
            height: overlayResizeStateRef.current.originHeight + (event.clientY - overlayResizeStateRef.current.startY),
          },
          overlayContainerRef.current,
        );

        setOverlayDesktopSize(nextSize);
        setOverlayDesktopPosition((currentPosition) =>
          currentPosition ? clampOverlayPosition(currentPosition, nextSize, overlayContainerRef.current) : currentPosition,
        );
      }
    };

    const handlePointerUp = () => {
      overlayDragRef.current = null;
      overlayResizeStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", syncOverlayToBounds);
    syncOverlayToBounds();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", syncOverlayToBounds);
    };
  }, [overlayDesktopSize]);

  const overlayDesktopStyle = overlayDesktopPosition
    ? {
        top: `${overlayDesktopPosition.y}px`,
        left: `${overlayDesktopPosition.x}px`,
        width: `${overlayDesktopSize.width}px`,
        height: isOverlayCollapsed ? "auto" : `${overlayDesktopSize.height}px`,
      }
    : {
        top: `${DESKTOP_OVERLAY_OFFSET}px`,
        right: `${DESKTOP_OVERLAY_OFFSET}px`,
        width: `${overlayDesktopSize.width}px`,
        height: isOverlayCollapsed ? "auto" : `${overlayDesktopSize.height}px`,
      };

  const handleOverlayDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    overlayDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: overlayDesktopPosition?.x ?? 0,
      originY: overlayDesktopPosition?.y ?? 0,
    };

    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleOverlayResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    overlayResizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: overlayDesktopSize.width,
      originHeight: overlayDesktopSize.height,
    };

    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  };

  const resetOverlayDesktopState = () => {
    setOverlayDesktopPosition(null);
    setOverlayDesktopSize({ width: 512, height: 560 });
    setIsOverlayCollapsed(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04120d] text-white lg:h-screen">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(22,71,48,0.58),transparent_42%),linear-gradient(180deg,#05150f_0%,#04100c_46%,#030a08_100%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(88,140,111,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(88,140,111,0.08)_1px,transparent_1px)] [background-size:140px_140px]" />
        <div className="absolute left-[-8%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#39d98a]/10 blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-[#2a6f52]/18 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1920px] flex-col px-4 pb-4 pt-4 sm:px-6 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-8">
        <div className="flex items-center rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            aria-label="Вернуться на главную"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/82 transition hover:border-[#39d98a]/60 hover:bg-[#39d98a]/12 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative z-[12] mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,31,21,0.92),rgba(6,19,13,0.9))] px-3 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:px-3.5">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-3">
            <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
              <Popover open={isYasnaLibraryOpen} onOpenChange={setIsYasnaLibraryOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 text-sm font-medium text-white transition hover:border-[#39d98a]/35 hover:bg-[#39d98a]/[0.1]"
                  >
                    <span>{yasnaLibraryPanelCopy.triggerLabel}</span>
                    <ChevronsUpDown className="h-4 w-4 text-white/70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[min(92vw,360px)] rounded-[24px] border border-white/10 bg-[#071710]/95 p-2.5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                >
                  {selectedLibraryYasnas.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLibraryYasnaIds([])}
                        className="mb-2 ml-auto flex rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/72 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                      >
                        Очистить
                      </button>
                    ) : null}

                  <Command className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,30,20,0.92),rgba(5,18,12,0.94))] text-white [&_[cmdk-input-wrapper]]:border-white/10 [&_[cmdk-input-wrapper]]:px-2 [&_[cmdk-input-wrapper]_svg]:text-white/40 [&_[cmdk-input]]:h-10 [&_[cmdk-input]]:text-sm [&_[cmdk-input]]:text-white [&_[cmdk-input]]:placeholder:text-white/35">
                    <CommandInput placeholder="Найти Ясну" />
                    <CommandList className="max-h-[320px] px-1 pb-1">
                      <CommandEmpty>Ничего не найдено.</CommandEmpty>
                      <CommandGroup>
                        {yasnas.map((yasna) => {
                          const isSelected = selectedLibraryYasnaIds.includes(yasna.id);
                          return (
                            <CommandItem
                              key={yasna.id}
                              value={yasna.title}
                              onSelect={() => toggleYasnaInLibrary(yasna.id)}
                              className="mb-1 items-center gap-2 rounded-[16px] border border-transparent px-2.5 py-2 text-white/84 data-[selected=true]:border-[#39d98a]/28 data-[selected=true]:bg-[#39d98a]/[0.08] data-[selected=true]:text-white"
                            >
                              <span className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#39d98a]/90 bg-[#39d98a] text-[#07110c]" : "border-white/18 bg-white/[0.04] text-transparent"}`}>
                                <Check className="h-3 w-3" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-white">{yasna.title}</div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-0 flex-1">
              {selectedLibraryYasnas.length > 0 ? (
                <div className="yasna-scroll overflow-x-auto pb-0.5">
                  <div className="flex min-w-max items-center gap-1.5">
                    {selectedLibraryYasnas.map((yasna) => (
                      <div
                        key={yasna.id}
                        className={`flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-1 transition ${
                          yasna.isActive
                            ? "border-[#39d98a]/82 bg-[#143523] text-white shadow-[0_0_0_1px_rgba(57,217,138,0.22),0_14px_34px_rgba(57,217,138,0.18)]"
                            : "border-white/10 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectYasna(yasna.id)}
                          title={getTooltipText(yasna.family, yasna.summary)}
                          className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[13px]"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${yasna.isActive ? "bg-[#39d98a] shadow-[0_0_12px_rgba(57,217,138,0.72)]" : "bg-white/28"}`}
                          />
                          <span className="max-w-[190px] truncate">{yasna.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeYasnaFromLibraryRow(yasna.id);
                          }}
                          aria-label={`Убрать ${yasna.title} из строки выбранных Ясн`}
                          className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-full border border-transparent text-white/44 transition hover:border-white/12 hover:bg-white/[0.08] hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={GRID_TEMPLATE}>
          <aside className={`yasna-scroll flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-2.5 backdrop-blur-xl ${SIDE_COLUMN_DESKTOP_LAYOUT}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-[#8ab79f]">Механики</div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllMechanics}
                className={`inline-flex w-full min-h-[48px] items-center justify-center whitespace-nowrap rounded-[18px] border px-4 py-3.5 text-center text-[13px] font-medium leading-tight text-white transition ${
                  allMechanicsSelected
                    ? "border-white/14 bg-white/8 hover:border-white/24 hover:bg-white/12"
                    : "border-[#39d98a]/25 bg-[#39d98a]/10 hover:border-[#39d98a]/55 hover:bg-[#39d98a]/16"
                }`}
              >
                {allMechanicsSelected ? "Сброс" : "Все"}
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 pb-1 pr-1">
              {mechanicGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/42">{group.title}</div>
                  <div className="space-y-2">
                    {group.ids.map((mechanicId) => {
                      const mechanic = mechanicsById[mechanicId];
                      const isActive = activeMechanicIds.includes(mechanic.id);

                      return (
                        <StarMechanicListButton
                          key={mechanic.id}
                          mechanic={mechanic}
                          isActive={isActive}
                          onClick={() => toggleMechanic(mechanic.id)}
                          tooltip={getTooltipText(mechanic.alias, mechanic.description)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className={`flex ${STAR_SCENE_MIN} ${CENTER_COLUMN_DESKTOP_LAYOUT} flex-col overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-1.5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-2`}>
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-[#8ab79f]">Центральная звезда</div>
            </div>
              <div className={`relative flex ${STAR_SCENE_INNER_MIN} flex-1 items-center justify-center overflow-visible rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(68,131,96,0.2),transparent_28%),radial-gradient(circle_at_center,rgba(57,217,138,0.09),transparent_34%),linear-gradient(180deg,rgba(4,22,15,0.82),rgba(3,11,8,0.96))] ${STAR_SCENE_PADDING} lg:min-h-0`}>

              <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_80%_8%,rgba(255,255,255,0.06),transparent_20%),repeating-radial-gradient(circle_at_center,rgba(118,170,140,0.06)_0_1px,transparent_1px_44px)]" />
              <div className="pointer-events-none absolute inset-x-[12%] top-[11%] h-[28%] rounded-full bg-[#39d98a]/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-[18%] rounded-full bg-black/28 blur-2xl" />

              <div className={`relative flex aspect-square ${STAR_CONTAINER_MAX} items-center justify-center`}>
                <div className="pointer-events-none absolute inset-[8%] rounded-full border border-white/6" />
                <div className="pointer-events-none absolute inset-[18%] rounded-full border border-[#39d98a]/10" />
                <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="h-auto w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="star-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <circle cx={CENTER_X} cy={CENTER_Y} r="516" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="4 16" />
                  <circle cx={CENTER_X} cy={CENTER_Y} r={GRID_RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.4" />

                  {ringPoints.map((point) => (
                    <line
                      key={`spoke-${point.index}`}
                      x1={CENTER_X}
                      y1={CENTER_Y}
                      x2={point.x}
                      y2={point.y}
                      stroke="rgba(255,255,255,0.14)"
                      strokeWidth="1.6"
                    />
                  ))}

                  {displayMechanics.map((mechanic) => {
                    if (mechanic.kind === "contrast") {
                      return (
                        <StarContrastOverlay
                          key={mechanic.id}
                          mechanic={mechanic}
                          selectedPoint={selectedPoint}
                          starPoints={starPoints}
                          disableMotion={prefersReducedMotion}
                        />
                      );
                    }

                    const path = getMechanicPath(mechanic, starPoints);
                    const badgePosition = getMechanicBadgePosition(mechanic, starPoints);

                    if (mechanic.kind === "line") {
                      const visualStyle = getMechanicVisualStyle(mechanic);

                      return (
                        <g key={mechanic.id} data-mechanic-overlay={mechanic.id} data-mechanic-kind="line">
                          <path
                            d={path}
                            fill="none"
                            stroke={mechanic.stroke}
                            strokeWidth={visualStyle.haloWidth}
                            strokeLinecap="round"
                            opacity={visualStyle.haloOpacity}
                            filter="url(#star-glow)"
                            data-mechanic-layer="halo"
                          />
                          <path
                            d={path}
                            fill="none"
                            stroke={mechanic.stroke}
                            strokeWidth={visualStyle.coreWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={visualStyle.dashArray}
                            filter="url(#star-glow)"
                            data-mechanic-layer="core"
                          >
                            <StrokeDashAnimation
                              from={visualStyle.dashOffsetFrom}
                              duration={visualStyle.animationDuration}
                              disabled={prefersReducedMotion}
                            />
                          </path>
                          <path
                            d={path}
                            fill="none"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth={visualStyle.accentWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={visualStyle.accentDashArray}
                            opacity={visualStyle.accentOpacity}
                            filter="url(#star-glow)"
                            data-mechanic-layer="accent"
                          >
                            <StrokeDashAnimation
                              from={visualStyle.accentDashOffsetFrom}
                              duration={visualStyle.animationDuration}
                              disabled={prefersReducedMotion}
                            />
                          </path>
                          <g transform={`translate(${badgePosition.x}, ${badgePosition.y - 22})`}>
                            <rect
                              x={-Math.max(46, mechanic.shortTitle.length * 6.6 / 2 + 18)}
                              y={-15}
                              width={Math.max(92, mechanic.shortTitle.length * 6.6 + 36)}
                              height="30"
                              rx="15"
                              fill="rgba(4,18,13,0.9)"
                              stroke={mechanic.stroke}
                              strokeWidth="1.1"
                            />
                            <text textAnchor="middle" y="6" fill="rgba(255,255,255,0.96)" fontSize="15" letterSpacing="0.08em" fontWeight={700}>
                              {mechanic.shortTitle}
                            </text>
                          </g>
                        </g>
                      );
                    }

                    if (mechanic.kind === "arc") {
                      const visualStyle = getMechanicVisualStyle(mechanic);

                      return (
                        <g key={mechanic.id} data-mechanic-overlay={mechanic.id} data-mechanic-kind="arc">
                          <path
                            d={path}
                            fill="none"
                            stroke={mechanic.stroke}
                            strokeWidth={visualStyle.haloWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={visualStyle.haloOpacity}
                            filter="url(#star-glow)"
                            data-mechanic-layer="halo"
                          />
                          <path
                            d={path}
                            fill="none"
                            stroke={mechanic.stroke}
                            strokeWidth={visualStyle.coreWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={visualStyle.dashArray}
                            filter="url(#star-glow)"
                            data-mechanic-layer="core"
                          >
                            <StrokeDashAnimation
                              from={visualStyle.dashOffsetFrom}
                              duration={visualStyle.animationDuration}
                              disabled={prefersReducedMotion}
                            />
                          </path>
                          <path
                            d={path}
                            fill="none"
                            stroke="rgba(255,255,255,0.88)"
                            strokeWidth={visualStyle.accentWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={visualStyle.accentDashArray}
                            opacity={visualStyle.accentOpacity}
                            filter="url(#star-glow)"
                            data-mechanic-layer="accent"
                          >
                            <StrokeDashAnimation
                              from={visualStyle.accentDashOffsetFrom}
                              duration={visualStyle.animationDuration}
                              disabled={prefersReducedMotion}
                            />
                          </path>
                        </g>
                      );
                    }

                    const denseMechanicState = displayMechanics.length >= 4;

                    return (
                      <g key={mechanic.id}>
                        <path
                          d={path}
                          fill={mechanic.fill}
                          fillOpacity={denseMechanicState ? 0.08 : 1}
                          stroke={mechanic.stroke}
                          strokeOpacity={denseMechanicState ? 0.96 : 1}
                          strokeWidth={denseMechanicState ? 3.4 : 3.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#star-glow)"
                        />
                      </g>
                    );
                  })}

                  {starPoints.map((point) => {
                    const pointText = pointViewsByIndex.get(point.index)?.rawText ?? "";
                    const layout = getPointLabelLayout(point, pointText);
                    const box = getLabelBox(layout, point);
                    const labelLines = getPointLabelLines(pointText, layout.maxChars, POINT_LABEL_LINES_MAX);
                    const tooltip = getPointTooltip(pointText);
                    const guideTarget = getGuideTarget(layout, point);
                    const leaderStart = getLeaderStart(point);
                    const badgePosition = getPointNumberBadgePosition(point);
                    const isSelected = selectedPoint === point.index;
                    const isHighlighted = highlightedPoints.has(point.index);
                    const hasYasnaData = Boolean(pointText);
                    const textAnchor = getLabelTextAnchor(layout);
                    const textX = getLabelTextX(layout, point);
                    const linesHeight = labelLines.length * LABEL_LINE_HEIGHT;
                    const labelStartY = box.y + box.height / 2 - linesHeight / 2 + LABEL_TEXT_DY;

                    return (
                      <g
                        key={`node-${point.index}`}
                        onClick={() => selectPoint(point.index)}
                        style={{ cursor: "pointer" }}
                      >
                        <title>{tooltip || `${POINT_TOOLTIP_FALLBACK} ${point.index}`}</title>
                        <line
                          x1={leaderStart.x}
                          y1={leaderStart.y}
                          x2={guideTarget.x}
                          y2={guideTarget.y}
                          stroke={isSelected ? GUIDE_ACTIVE_STROKE : GUIDE_STROKE}
                          strokeWidth={isSelected ? GUIDE_ACTIVE_WIDTH : GUIDE_WIDTH}
                          strokeDasharray={isSelected ? GUIDE_ACTIVE_DASH : GUIDE_DASH}
                        />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={isSelected ? POINT_SELECTED_RADIUS : POINT_OUTER_RADIUS}
                          fill={
                            isSelected
                              ? POINT_OUTER_FILL_ACTIVE
                              : isHighlighted
                                ? POINT_OUTER_FILL_HIGHLIGHT
                                : hasYasnaData
                                  ? POINT_OUTER_FILL_DEFAULT
                                  : POINT_OUTER_FILL_DIM
                          }
                          stroke={isSelected ? "rgba(57,217,138,0.96)" : hasYasnaData ? POINT_OUTER_STROKE : POINT_OUTER_STROKE_DIM}
                          strokeWidth={isSelected ? 3.2 : 2}
                        />
                        <circle cx={point.x} cy={point.y} r={POINT_INNER_RADIUS} fill={isSelected ? POINT_INNER_FILL_ACTIVE : POINT_INNER_FILL} />
                        <text
                          x={point.x}
                          y={point.y + POINT_NUMBER_DY}
                          textAnchor="middle"
                          fill={isSelected ? POINT_NUMBER_FILL_ACTIVE : POINT_NUMBER_FILL}
                          fontSize={POINT_NUMBER_SIZE}
                          fontWeight={POINT_NUMBER_WEIGHT}
                          letterSpacing="0.01em"
                        >
                          {point.index}
                        </text>
                      </g>
                    );
                  })}

                  <g>
                    <circle
                      cx={CENTER_X}
                      cy={CENTER_Y}
                      r={CENTER_RING_OUTER}
                      fill="rgba(8, 24, 18, 0.95)"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="2.2"
                    />
                    <circle
                      cx={CENTER_X}
                      cy={CENTER_Y}
                      r={CENTER_RING_INNER}
                      fill="rgba(255,255,255,0.035)"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1.3"
                    />
                    <path
                      d={`M ${CENTER_X} ${CENTER_Y - CENTER_DIAMOND_TOP} L ${CENTER_X + CENTER_DIAMOND_SIDE} ${CENTER_Y} L ${CENTER_X} ${CENTER_Y + CENTER_DIAMOND_BOTTOM} L ${CENTER_X - CENTER_DIAMOND_LEFT} ${CENTER_Y} Z`}
                      fill="rgba(240, 247, 243, 0.78)"
                      stroke="rgba(240, 247, 243, 0.18)"
                      strokeWidth="1.2"
                    />
                  </g>
                </svg>

                {starPoints.map((point) => {
                    const pointText = pointViewsByIndex.get(point.index)?.rawText ?? "";

                  const layout = getPointLabelLayout(point, pointText);
                  const box = getLabelBox(layout, point);
                  const labelLines = getPointLabelLines(pointText, layout.maxChars, POINT_LABEL_LINES_MAX);
                  const tooltip = getPointTooltip(pointText);
                  const isSelected = selectedPoint === point.index;
                  const hasYasnaData = Boolean(pointText);
                  const alignClass = layout.align === "left" ? "items-start text-left" : layout.align === "right" ? "items-end text-right" : "items-center text-center";

                  return (
                    <StarPointLabelOverlay
                      key={`label-${point.index}`}
                      pointIndex={point.index}
                      labelLines={labelLines}
                      tooltip={tooltip}
                      isSelected={isSelected}
                      hasYasnaData={hasYasnaData}
                      alignClass={alignClass}
                      onSelect={() => selectPoint(point.index)}
                      style={{
                        left: `${(box.x / VIEWBOX_SIZE) * 100}%`,
                        top: `${(box.y / VIEWBOX_SIZE) * 100}%`,
                        width: `${(box.width / VIEWBOX_SIZE) * 100}%`,
                        minHeight: `${(box.height / VIEWBOX_SIZE) * 100}%`,
                        padding: 0,
                        borderRadius: 0,
                        fontSize: "clamp(13px, 0.98vw, 15px)",
                        lineHeight: 1.4,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "normal",
                        hyphens: "none",
                        boxSizing: "border-box",
                        overflow: "visible",
                        background: "transparent",
                        textShadow: isSelected
                          ? "0 0 18px rgba(57,217,138,0.28), 0 2px 12px rgba(0,0,0,0.46)"
                          : "0 2px 12px rgba(0,0,0,0.46)",
                        textWrap: "balance",
                      }}
                    />
                  );
                })}
              </div>

              {contextPanelModel.blocks.length > 0 ? (
                <div
                  ref={overlayContainerRef}
                  className="pointer-events-none absolute inset-x-3 bottom-3 z-[12] flex justify-center sm:inset-x-4 sm:bottom-4 lg:inset-0"
                  data-testid="star-selection-overlay"
                >
                  <div
                    ref={overlayResizeRef}
                    className="pointer-events-auto w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,22,15,0.92),rgba(4,13,9,0.95))] shadow-[0_28px_70px_rgba(0,0,0,0.34)] ring-1 ring-black/18 backdrop-blur-2xl lg:absolute lg:max-w-none"
                    style={overlayDesktopStyle}
                    data-testid="star-selection-overlay-window"
                  >
                    <div className="hidden items-center justify-between gap-3 border-b border-white/10 bg-black/10 px-3 py-2 lg:flex">
                      <button
                        type="button"
                        onPointerDown={handleOverlayDragStart}
                        className="inline-flex cursor-grab items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/74 active:cursor-grabbing"
                        data-testid="star-selection-overlay-drag-handle"
                      >
                        Переместить
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOverlayCollapsed((value) => !value)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/74 transition hover:border-[#39d98a]/35 hover:text-white"
                          data-testid="star-selection-overlay-collapse"
                        >
                          {isOverlayCollapsed ? "Развернуть" : "Свернуть"}
                        </button>
                        <button
                          type="button"
                          onClick={resetOverlayDesktopState}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/74 transition hover:border-[#39d98a]/35 hover:text-white"
                          data-testid="star-selection-overlay-reset"
                        >
                          Сбросить
                        </button>
                      </div>
                    </div>

                    {!isOverlayCollapsed ? (
                      <StarSelectionInsightCard
                        model={contextPanelModel}
                        className="w-full max-w-[1120px] max-h-[min(42vh,28rem)] overflow-y-auto rounded-none border-0 border-white/12 bg-transparent shadow-none ring-0 backdrop-blur-0 lg:w-[32rem] lg:h-[calc(100%-3rem)] lg:max-w-none lg:max-h-none"
                      />
                    ) : null}

                    <button
                      type="button"
                      onPointerDown={handleOverlayResizeStart}
                      aria-label="Изменить размер overlay"
                      className="absolute bottom-2 right-2 hidden h-5 w-5 cursor-se-resize rounded-full border border-white/12 bg-white/[0.06] lg:block"
                      data-testid="star-selection-overlay-resize-handle"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

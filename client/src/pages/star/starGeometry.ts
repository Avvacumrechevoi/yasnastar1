import type { Mechanic } from "./apiContract";

export type Point = {
  index: number;
  x: number;
  y: number;
};

export type LabelLayout = {
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  align: "left" | "right" | "center";
  maxChars: number;
};

export const VIEWBOX_SIZE = 1800;
export const CENTER_X = 900;
export const CENTER_Y = 900;
export const POINT_RADIUS = 608;
export const GRID_RADIUS = 578;
export const LABEL_SAFE_MARGIN_X = 24;
export const LABEL_SAFE_MARGIN_RIGHT = 24;
export const LABEL_SAFE_MARGIN_TOP = 24;
export const LABEL_SAFE_MARGIN_BOTTOM = 48;
export const POINT_OUTER_RADIUS = 32;
export const POINT_SELECTED_RADIUS = 37;
export const POINT_NUMBER_BADGE_RADIUS = POINT_OUTER_RADIUS;
export const LABEL_NUMBER_BADGE_GAP = 0;
export const LABEL_CLEARANCE = 72;
export const LABEL_VERTICAL_SHIFT = 86;
export const LABEL_BOX_MIN_WIDTH = 188;
export const LABEL_BOX_MAX_WIDTH = 356;
export const LABEL_BOX_SIDE_ROW_MIN_WIDTH = 138;
export const LABEL_BOX_SIDE_ROW_MAX_WIDTH = 168;
export const LABEL_BOX_AXIS_SIDE_MIN_WIDTH = 132;
export const LABEL_BOX_AXIS_SIDE_MAX_WIDTH = 144;
export const LABEL_BOX_HORIZONTAL_PADDING = 72;
export const LABEL_BOX_SIDE_ROW_HORIZONTAL_PADDING = 42;
export const LABEL_BOX_AXIS_SIDE_HORIZONTAL_PADDING = 30;
export const LABEL_BOX_CHAR_WIDTH = 13.5;
export const LABEL_BOX_BASE_HEIGHT = 80;
export const LABEL_BOX_LINE_HEIGHT = 28;
export const POINT_LABEL_LINES_MAX = 3;
export const LONG_TWO_WORD_LABEL_BONUS_CHARS = 2;
export const LONG_LABEL_BONUS_THRESHOLD = 13.4;
export const LABEL_POINT_SAFE_RADIUS = POINT_SELECTED_RADIUS + 40;
export const LABEL_POINT_SAFE_OFFSET = 22;
export const LABEL_OUTER_GEOMETRY_GAP = 24;
export const LABEL_POINT_EDGE_GAP = 24;
export const LABEL_POINT_EDGE_GAP_TOLERANCE = 0.35;
export const LABEL_BADGE_DISTANCE_TOLERANCE = 0.35;
export const STAR_GUIDE_GAP = 10;

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

export function normalizeInlineText(text?: string | null) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
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

export function getPointLabel(text?: string | null) {
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

export function getPointEssence(text?: string | null) {
  const segments = getPointSegments(text);
  const candidate = segments[1] || segments[0] || "";
  return truncate(candidate.replace(/;\s*/g, " · "), 220);
}

export function getPointTooltip(text?: string | null) {
  return getPointSegments(text).join("\n");
}

export function polarPoint(index: number, radius: number): Point {
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

function getMechanicPoints(mechanic: Pick<Mechanic, "points">, pointMap: Point[]) {
  return mechanic.points.map((pointIndex) => pointMap[pointIndex]);
}

export function getMechanicPath(mechanic: Pick<Mechanic, "kind" | "points">, pointMap: Point[]) {
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

export function getMechanicBadgePosition(mechanic: Pick<Mechanic, "kind" | "points">, pointMap: Point[]) {
  const mechanicPoints = getMechanicPoints(mechanic, pointMap);

  if (mechanic.kind === "line") {
    return getLineMidpoint(mechanicPoints);
  }

  if (mechanic.kind === "arc") {
    return mechanicPoints[Math.floor(mechanicPoints.length / 2)];
  }

  return getCentroid(mechanicPoints);
}

export function getTooltipText(...parts: Array<string | null | undefined>) {
  return parts
    .map((part) => normalizeInlineText(part))
    .filter(Boolean)
    .join("\n\n");
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

export function getPointLabelLines(text: string | null | undefined, maxChars = 16, maxLines = 2) {
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

export function getOppositePoint(index: number) {
  return (index + 6) % 12;
}

export function getPointLabelLayout(point: Point, text?: string | null): LabelLayout {
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

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

export function getPointNumberBadgePosition(point: Point) {
  return {
    x: point.x,
    y: point.y,
  };
}

export function getLabelBox(layout: LabelLayout, point?: Point) {
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
      const badge = getPointNumberBadgePosition(point);
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

export function getPointLabelCollisionMetrics(index: number, text?: string | null) {
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

export function getPointLabelSideMetrics(index: number, text?: string | null) {
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

export function getPointLabelOuterSideMetrics(index: number, text?: string | null) {
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

export function getPointNumberBadgeMetrics(index: number) {
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

export function getPointLabelGapMetrics(index: number, text?: string | null) {
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

export function getPointLabelViewportMetrics(index: number, text?: string | null) {
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

export function getPointLabelClusterMetrics(textByIndex: Partial<Record<number, string | null | undefined>> = {}) {
  const items = Array.from({ length: 12 }, (_, index) => {
    const metrics = getPointLabelViewportMetrics(index, textByIndex[index]);

    return {
      index,
      ...metrics,
      left: metrics.box.x,
      top: metrics.box.y,
      right: metrics.box.x + metrics.box.width,
      bottom: metrics.box.y + metrics.box.height,
    };
  });

  const left = Math.min(...items.map(item => item.left));
  const top = Math.min(...items.map(item => item.top));
  const right = Math.max(...items.map(item => item.right));
  const bottom = Math.max(...items.map(item => item.bottom));
  const spanWidth = right - left;
  const spanHeight = bottom - top;
  const centerX = left + spanWidth / 2;
  const centerY = top + spanHeight / 2;
  const leftGap = left;
  const rightGap = VIEWBOX_SIZE - right;
  const topGap = top;
  const bottomGap = VIEWBOX_SIZE - bottom;

  return {
    items,
    left,
    top,
    right,
    bottom,
    spanWidth,
    spanHeight,
    centerX,
    centerY,
    leftGap,
    rightGap,
    topGap,
    bottomGap,
    horizontalCenterOffset: centerX - CENTER_X,
    verticalCenterOffset: centerY - CENTER_Y,
    horizontalMarginImbalance: Math.abs(leftGap - rightGap),
    verticalMarginImbalance: Math.abs(topGap - bottomGap),
    widthUsageRatio: spanWidth / VIEWBOX_SIZE,
    heightUsageRatio: spanHeight / VIEWBOX_SIZE,
    keepsClusterInsideViewport:
      leftGap >= -0.0001 && rightGap >= -0.0001 && topGap >= -0.0001 && bottomGap >= -0.0001,
  };
}

export function getGuideTarget(layout: LabelLayout, point?: Point) {
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

export function getLabelTextAnchor(layout: LabelLayout) {
  if (layout.align === "left") {
    return "start";
  }

  if (layout.align === "right") {
    return "end";
  }

  return "middle";
}

export function getLabelTextX(layout: LabelLayout, point?: Point) {
  const box = getLabelBox(layout, point);

  if (layout.align === "left") {
    return box.x + 22;
  }

  if (layout.align === "right") {
    return box.x + box.width - 22;
  }

  return box.x + box.width / 2;
}

export function getLeaderStart(point: Point) {
  const dx = point.x - CENTER_X;
  const dy = point.y - CENTER_Y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  return {
    x: point.x + (dx / length) * (POINT_OUTER_RADIUS + STAR_GUIDE_GAP),
    y: point.y + (dy / length) * (POINT_OUTER_RADIUS + STAR_GUIDE_GAP),
  };
}

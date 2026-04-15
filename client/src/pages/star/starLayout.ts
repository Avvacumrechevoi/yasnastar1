export const QUERY_CACHE_STALE_MS = 5 * 60 * 1000;
export const QUERY_CACHE_GC_MS = 30 * 60 * 1000;

export const POINT_INNER_RADIUS = 18;
export const POINT_NUMBER_DY = 6;
export const POINT_NUMBER_SIZE = 19;
export const POINT_NUMBER_WEIGHT = 800;
export const GUIDE_STROKE = "rgba(255,255,255,0.18)";
export const GUIDE_ACTIVE_STROKE = "rgba(57,217,138,0.68)";
export const GUIDE_DASH = "3 9";
export const GUIDE_ACTIVE_DASH = "5 7";
export const GUIDE_WIDTH = 1.3;
export const GUIDE_ACTIVE_WIDTH = 2.2;
export const LABEL_LINE_HEIGHT = 24;
export const LABEL_TEXT_DY = 6;
export const POINT_TOOLTIP_FALLBACK = "Точка";

export const CENTER_RING_OUTER = 112;
export const CENTER_RING_INNER = 66;
export const CENTER_DIAMOND_TOP = 36;
export const CENTER_DIAMOND_SIDE = 22;
export const CENTER_DIAMOND_BOTTOM = 36;
export const CENTER_DIAMOND_LEFT = 22;

export const POINT_OUTER_STROKE = "rgba(255,255,255,0.68)";
export const POINT_OUTER_STROKE_DIM = "rgba(255,255,255,0.24)";
export const POINT_OUTER_FILL_DIM = "rgba(255,255,255,0.04)";
export const POINT_OUTER_FILL_DEFAULT = "rgba(255,255,255,0.08)";
export const POINT_OUTER_FILL_HIGHLIGHT = "rgba(255,255,255,0.16)";
export const POINT_OUTER_FILL_ACTIVE = "rgba(57,217,138,0.3)";
export const POINT_INNER_FILL = "rgba(4,18,13,0.88)";
export const POINT_INNER_FILL_ACTIVE = "rgba(57,217,138,0.94)";
export const POINT_NUMBER_FILL = "rgba(255,255,255,0.96)";
export const POINT_NUMBER_FILL_ACTIVE = "#04120d";

export const STAR_CONTAINER_MAX = "h-full w-full max-h-[min(78svh,1120px)] max-w-full lg:w-auto lg:max-h-[1120px]";
export const STAR_SCENE_MIN = "min-h-[72svh] sm:min-h-[920px]";
export const STAR_SCENE_INNER_MIN = "min-h-[68svh] sm:min-h-[900px]";
export const STAR_SCENE_PADDING = "px-1.5 py-1.5 sm:px-2.5 sm:py-2.5";
export const GRID_TEMPLATE = "mt-4 grid min-h-0 flex-1 grid-cols-1 gap-2 lg:h-[calc(100vh-9.5rem)] lg:max-h-[calc(100vh-9.5rem)] lg:min-h-0 lg:grid-cols-[108px_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden xl:grid-cols-[116px_minmax(0,1fr)] 2xl:grid-cols-[124px_minmax(0,1fr)]";
export const SIDE_COLUMN_DESKTOP_LAYOUT = "lg:h-full lg:max-h-full lg:self-stretch lg:overflow-y-auto lg:overscroll-contain";
export const CENTER_COLUMN_DESKTOP_LAYOUT = "lg:h-full lg:min-h-0 lg:self-stretch";

export function getStarLayoutClasses() {
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

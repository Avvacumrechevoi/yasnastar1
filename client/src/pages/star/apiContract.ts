import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../server/routers";

export type StarRouterOutputs = inferRouterOutputs<AppRouter>;

export type YasnaCatalogData = StarRouterOutputs["yasna"]["catalog"];
export type YasnaComputedState = StarRouterOutputs["yasna"]["computeState"];
export type YasnaCatalogItem = YasnaCatalogData["yasnas"][number];
export type Mechanic = YasnaCatalogData["mechanics"][number];
export type MechanicGroup = YasnaCatalogData["mechanicGroups"][number];
export type AnalysisModeId = YasnaCatalogData["analysisModes"][number]["id"];
export type ScenarioPreset = YasnaComputedState["negotiation"]["presets"][number];
export type ActiveYasna = YasnaComputedState["activeYasna"];
export type YasnaPointView = ActiveYasna["points"][number];
export type InspectorMechanic = YasnaComputedState["inspector"]["activeMechanics"][number];

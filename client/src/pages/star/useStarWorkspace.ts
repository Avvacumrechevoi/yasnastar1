import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { areAllMechanicsSelected, getNextMechanicSelection } from "@shared/yasnaSelection";
import { buildContextPanelModel } from "./contextPanel";
import {
  buildYasnaLibraryPanelCopy,
  buildYasnaLibraryRow,
  pruneYasnaLibrarySelection,
  removeYasnaLibrarySelection,
  toggleYasnaLibrarySelection,
} from "./yasnaLibrary";
import type { AnalysisModeId, Mechanic } from "./apiContract";
import { buildStaticComputedState, STATIC_PREVIEW_MODE, useStaticCatalogData } from "./staticPreview";

const QUERY_CACHE_STALE_MS = 5 * 60 * 1000;
const QUERY_CACHE_GC_MS = 30 * 60 * 1000;
const SELECTED_POINT_LABEL = "Выбранная полочка";

export function useStarWorkspace() {
  const { catalogData: staticCatalogData, snapshot: staticSnapshot, isLoading: isStaticCatalogLoading } = useStaticCatalogData(STATIC_PREVIEW_MODE);
  const catalogQuery = trpc.yasna.catalog.useQuery(undefined, {
    staleTime: QUERY_CACHE_STALE_MS,
    gcTime: QUERY_CACHE_GC_MS,
    refetchOnWindowFocus: false,
    enabled: !STATIC_PREVIEW_MODE,
  });
  const catalogData = STATIC_PREVIEW_MODE ? staticCatalogData : catalogQuery.data;
  const isCatalogLoading = STATIC_PREVIEW_MODE ? isStaticCatalogLoading : catalogQuery.isLoading;

  const [activeYasnaId, setActiveYasnaId] = useState<string>("");
  const [mechanicSelectionByYasnaId, setMechanicSelectionByYasnaId] = useState<Record<string, string[]>>({});
  const [selectedPointByYasnaId, setSelectedPointByYasnaId] = useState<Record<string, number | null>>({});
  const [analysisMode, setAnalysisMode] = useState<AnalysisModeId>("free");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [secondaryYasnaId, setSecondaryYasnaId] = useState<string | null>(null);
  const [selectedLibraryYasnaIds, setSelectedLibraryYasnaIds] = useState<string[]>([]);
  const [isYasnaLibraryOpen, setIsYasnaLibraryOpen] = useState(false);

  useEffect(() => {
    if (!activeYasnaId && catalogData?.defaultYasnaId) {
      setActiveYasnaId(catalogData.defaultYasnaId);
    }
  }, [activeYasnaId, catalogData?.defaultYasnaId]);

  const queryInput = useMemo(() => {
    const yasnaId = activeYasnaId || catalogData?.defaultYasnaId || null;
    const activeMechanicIds = yasnaId ? mechanicSelectionByYasnaId[yasnaId] ?? [] : [];
    const selectedPoint = yasnaId ? selectedPointByYasnaId[yasnaId] ?? null : null;

    return {
      yasnaId,
      selectedPoint,
      activeMechanicIds,
      analysisMode,
      presetId: analysisMode === "guided" ? activePresetId : null,
      secondaryYasnaId: analysisMode === "synthesis" ? secondaryYasnaId : null,
    };
  }, [activePresetId, activeYasnaId, analysisMode, catalogData?.defaultYasnaId, mechanicSelectionByYasnaId, secondaryYasnaId, selectedPointByYasnaId]);

  const staticComputedState = useMemo(
    () => (STATIC_PREVIEW_MODE && staticSnapshot ? buildStaticComputedState(staticSnapshot, queryInput) : null),
    [queryInput, staticSnapshot],
  );
  const stateQuery = trpc.yasna.computeState.useQuery(queryInput, {
    enabled: !STATIC_PREVIEW_MODE && Boolean(queryInput.yasnaId),
    staleTime: QUERY_CACHE_STALE_MS,
    gcTime: QUERY_CACHE_GC_MS,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const computedState = STATIC_PREVIEW_MODE ? staticComputedState : stateQuery.data;
  const isStateLoading = STATIC_PREVIEW_MODE ? isStaticCatalogLoading : stateQuery.isLoading;

  const yasnas = catalogData?.yasnas ?? [];
  const yasnaIds = useMemo(() => yasnas.map((item) => item.id), [yasnas]);
  const mechanics = catalogData?.mechanics ?? [];
  const mechanicGroups = catalogData?.mechanicGroups ?? [];
  const currentYasnaKey = activeYasnaId || catalogData?.defaultYasnaId || "";
  const activeMechanicIds = currentYasnaKey ? mechanicSelectionByYasnaId[currentYasnaKey] ?? [] : [];
  const selectedPoint = currentYasnaKey ? selectedPointByYasnaId[currentYasnaKey] ?? null : null;
  const activeYasna = computedState?.activeYasna ?? null;
  const activeMechanics = computedState?.activeMechanics ?? [];
  const latestMechanic = computedState?.latestMechanic ?? null;
  const catalogAnalysisModes = catalogData?.analysisModes ?? [];
  const availablePresets = computedState?.negotiation.presets ?? [];
  const synthesisCandidates = useMemo(() => yasnas.filter((yasna) => yasna.id !== activeYasna?.id), [activeYasna?.id, yasnas]);
  const allMechanicIds = useMemo(() => mechanics.map((item) => item.id), [mechanics]);
  const mechanicsById = useMemo(
    () => Object.fromEntries(mechanics.map((mechanic) => [mechanic.id, mechanic])) as Record<string, Mechanic>,
    [mechanics],
  );
  const pointViewsByIndex = useMemo(
    () => new Map((activeYasna?.points ?? []).map((point) => [point.index, point])),
    [activeYasna?.points],
  );
  const optimisticActiveMechanics = useMemo(
    () => activeMechanicIds.map((mechanicId) => mechanicsById[mechanicId]).filter((mechanic): mechanic is Mechanic => Boolean(mechanic)),
    [activeMechanicIds, mechanicsById],
  );
  // The central star should stay neutral until the user explicitly enables mechanics.
  const displayMechanics = optimisticActiveMechanics;
  const allMechanicsSelected = areAllMechanicsSelected(activeMechanicIds, allMechanicIds);
  const selectedPointView = computedState?.selectedPoint ?? null;
  const oppositePointView = computedState?.oppositePoint ?? null;
  const selectedPointText = selectedPointView?.rawText ?? null;
  const selectedPointLabel = selectedPointView?.label ?? SELECTED_POINT_LABEL;
  const selectedPointEssence = selectedPointView?.essence ?? "";
  const selectedPointTooltip = selectedPointView?.tooltip ?? "";
  const oppositionMechanicActive = activeMechanicIds.includes("opposition-link");
  const oppositePointIndex = oppositePointView?.index ?? null;
  const oppositePointLabel = oppositePointView?.label ?? "Полочка не выбрана";
  const highlightedPoints = useMemo(
    () => new Set(activeMechanicIds.length > 0 ? computedState?.highlightedPointIndices ?? [] : []),
    [activeMechanicIds.length, computedState?.highlightedPointIndices],
  );
  const selectedLibraryYasnas = useMemo(
    () => buildYasnaLibraryRow({
      yasnas,
      selectedIds: selectedLibraryYasnaIds,
      activeYasnaId: activeYasna?.id ?? (currentYasnaKey || null),
    }),
    [activeYasna?.id, currentYasnaKey, selectedLibraryYasnaIds, yasnas],
  );
  const yasnaLibraryPanelCopy = useMemo(() => buildYasnaLibraryPanelCopy(), []);

  useEffect(() => {
    if (analysisMode === "guided") {
      const firstPresetId = availablePresets[0]?.id ?? null;
      if (!activePresetId && firstPresetId) {
        setActivePresetId(firstPresetId);
      }
      if (activePresetId && !availablePresets.some((preset) => preset.id === activePresetId)) {
        setActivePresetId(firstPresetId);
      }
      return;
    }

    if (activePresetId !== null) {
      setActivePresetId(null);
    }
  }, [activePresetId, analysisMode, availablePresets]);

  useEffect(() => {
    setSelectedLibraryYasnaIds((current) => {
      const next = pruneYasnaLibrarySelection(current, yasnaIds);

      if (next.length === current.length && next.every((item, index) => item === current[index])) {
        return current;
      }

      return next;
    });
  }, [yasnaIds]);

  useEffect(() => {
    if (analysisMode === "synthesis") {
      if (!secondaryYasnaId || secondaryYasnaId === activeYasna?.id) {
        setSecondaryYasnaId(synthesisCandidates[0]?.id ?? null);
      }
      return;
    }

    if (secondaryYasnaId !== null) {
      setSecondaryYasnaId(null);
    }
  }, [activeYasna?.id, analysisMode, secondaryYasnaId, synthesisCandidates]);

  const selectYasna = (id: string) => {
    const currentYasnaId = activeYasna?.id ?? activeYasnaId;

    if (id === currentYasnaId) {
      return;
    }

    setActiveYasnaId(id);
    setAnalysisMode("free");
    setActivePresetId(null);
    setSecondaryYasnaId(null);
  };

  const selectPoint = (index: number) => {
    if (!currentYasnaKey) {
      return;
    }

    setSelectedPointByYasnaId((current) => ({
      ...current,
      [currentYasnaKey]: index,
    }));
  };

  const toggleMechanic = (id: string) => {
    if (!currentYasnaKey) {
      return;
    }

    setMechanicSelectionByYasnaId((current) => {
      const currentSelection = current[currentYasnaKey] ?? [];
      const nextSelection = currentSelection.includes(id)
        ? currentSelection.filter((item) => item !== id)
        : [...currentSelection, id];

      return {
        ...current,
        [currentYasnaKey]: nextSelection,
      };
    });
  };

  const toggleAllMechanics = () => {
    if (!currentYasnaKey) {
      return;
    }

    setMechanicSelectionByYasnaId((current) => {
      const currentSelection = current[currentYasnaKey] ?? [];

      return {
        ...current,
        [currentYasnaKey]: getNextMechanicSelection(currentSelection, allMechanicIds),
      };
    });
  };

  const toggleYasnaInLibrary = (id: string) => {
    const isAlreadySelected = selectedLibraryYasnaIds.includes(id);

    setSelectedLibraryYasnaIds((current) => toggleYasnaLibrarySelection(current, id));

    if (!isAlreadySelected) {
      selectYasna(id);
    }
  };

  const removeYasnaFromLibraryRow = (id: string) => {
    setSelectedLibraryYasnaIds((current) => removeYasnaLibrarySelection(current, id));
  };

  const contextMechanics = activeMechanicIds.length > 0
    ? (computedState?.inspector.activeMechanics?.length ? computedState.inspector.activeMechanics : displayMechanics)
    : [];
  const contextPanelModel = buildContextPanelModel({
    yasna: activeYasna
      ? {
          title: activeYasna.title,
          summary: activeYasna.summary,
          notes: activeYasna.notes,
          mechanics: activeYasna.mechanics,
          lessonFocus: computedState?.inspector.lessonFocus
            ? {
                pointIndex: computedState.inspector.lessonFocus.pointIndex,
                title: computedState.inspector.lessonFocus.title,
                description: computedState.inspector.lessonFocus.description,
                mechanicMentions: computedState.inspector.lessonFocus.mechanicMentions,
                sourceLesson: computedState.inspector.lessonFocus.sourceLesson,
              }
            : null,
          lessonPreviews: computedState?.inspector.lessonPreviews?.map((lessonPreview) => ({
            id: lessonPreview.id,
            title: lessonPreview.title,
            description: lessonPreview.description,
            sourceLesson: lessonPreview.sourceLesson,
            sourceFile: lessonPreview.sourceFile,
          })) ?? [],
        }
      : null,
    activeMechanics: contextMechanics.map((mechanic) => ({
      id: mechanic.id,
      title: mechanic.title,
      description: mechanic.description,
      contextText: "contextText" in mechanic && typeof mechanic.contextText === "string" ? mechanic.contextText : null,
    })),
    selectedPoint:
      selectedPoint !== null
        ? {
            index: selectedPoint,
            title: selectedPointLabel,
            text:
              computedState?.inspector.primaryText
              || selectedPointEssence
              || selectedPointTooltip
              || selectedPointText
              || null,
          }
        : null,
    negotiation: computedState
      ? {
          activePreset: computedState.negotiation.activePreset
            ? {
                id: computedState.negotiation.activePreset.id,
                label: "Сценарий",
                title: computedState.negotiation.activePreset.title,
                description: computedState.negotiation.activePreset.summary || computedState.negotiation.activePreset.question,
                tone: "accent",
              }
            : null,
          insights: (computedState.negotiation.insights ?? []).map((insight, index) => ({
            id: `${insight.kind}-${index}`,
            label:
              insight.kind === "synthesis"
                ? "Синтез"
                : insight.kind === "preset"
                  ? "Примета"
                  : insight.kind === "mechanic"
                    ? "Механика чтения"
                    : insight.kind === "point"
                      ? "Полочка"
                      : "Фокус",
            title: insight.title,
            description: insight.text,
            tone: insight.tone,
          })),
          recommendations: (computedState.negotiation.recommendations ?? []).map((recommendation, index) => ({
            id: `${index}`,
            title: recommendation.title,
            description: recommendation.description,
            reason: recommendation.reason,
          })),
        }
      : null,
    synthesis: computedState?.synthesis
      ? {
          enabled: computedState.synthesis.enabled,
          title: computedState.synthesis.title,
          summary: computedState.synthesis.summary,
          bridges: (computedState.synthesis.bridges ?? []).map((bridge, index) => ({
            id: `${bridge.primaryPointIndex}-${bridge.secondaryPointIndex}-${index}`,
            title: bridge.title,
            description: bridge.description,
          })),
          risks: computedState.synthesis.risks ?? [],
        }
      : null,
  });

  return {
    activeMechanicIds,
    activePresetId,
    activeYasna,
    activeYasnaId,
    analysisMode,
    availablePresets,
    catalogAnalysisModes,
    catalogData,
    computedState,
    contextPanelModel,
    currentYasnaKey,
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
  };
}

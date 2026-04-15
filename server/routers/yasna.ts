import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { computeYasnaState, getYasnaCatalog } from "../yasna/service";
import { refreshYasnaRuntimeCatalog } from "../yasna/runtimeCatalog";
import {
  getYasnaAdminStatus,
  syncYasnaCatalogToDatabase,
  updateYasnaMetadata,
  upsertYasnaPointText,
} from "../yasna/repository";

export const yasnaRouter = router({
  catalog: publicProcedure.query(async () => {
    await refreshYasnaRuntimeCatalog();
    return getYasnaCatalog();
  }),
  computeState: publicProcedure
    .input(
      z.object({
        yasnaId: z.string().optional().nullable(),
        selectedPoint: z.number().int().min(0).max(11).optional().nullable(),
        activeMechanicIds: z.array(z.string()).optional().nullable(),
        presetId: z.string().optional().nullable(),
        analysisMode: z.enum(["free", "guided", "synthesis"]).optional().nullable(),
        secondaryYasnaId: z.string().optional().nullable(),
      }),
    )
    .query(async ({ input }) => {
      await refreshYasnaRuntimeCatalog();
      return computeYasnaState(input);
    }),
  adminStatus: adminProcedure.query(async () => {
    await refreshYasnaRuntimeCatalog();
    return getYasnaAdminStatus();
  }),
  adminSync: adminProcedure.mutation(async () => {
    const snapshot = await syncYasnaCatalogToDatabase();
    await refreshYasnaRuntimeCatalog({ force: true });

    return {
      source: snapshot.source,
      defaultYasnaId: snapshot.defaultYasnaId,
      yasnaCount: snapshot.yasnas.length,
      mechanicCount: snapshot.mechanics.length,
    };
  }),
  adminUpdateYasnaMeta: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        family: z.string().min(1),
        title: z.string().min(1),
        summary: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const snapshot = await updateYasnaMetadata(input);
      await refreshYasnaRuntimeCatalog({ force: true });

      return {
        updatedId: input.id,
        source: snapshot.source,
      };
    }),
  adminUpdatePointText: adminProcedure
    .input(
      z.object({
        yasnaId: z.string().min(1),
        pointIndex: z.number().int().min(0).max(11),
        rawText: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const snapshot = await upsertYasnaPointText(input);
      await refreshYasnaRuntimeCatalog({ force: true });

      return {
        yasnaId: input.yasnaId,
        pointIndex: input.pointIndex,
        source: snapshot.source,
      };
    }),
});

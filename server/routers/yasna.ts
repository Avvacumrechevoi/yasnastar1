import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { computeYasnaState, getYasnaCatalog } from "../yasna/service";
import { refreshYasnaRuntimeCatalog } from "../yasna/runtimeCatalog";

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
});

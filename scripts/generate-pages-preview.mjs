import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_YASNA_ID, MECHANIC_GROUPS, MECHANICS, YASNA_DATA } from "../server/yasna/catalog.ts";
import { ANALYSIS_MODE_OPTIONS, toYasnaDetailView } from "../server/yasna/service.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectRoot, "client", "public", "pages-preview");
const outputFile = path.join(outputDirectory, "runtime.json");

function extractPrimaryPointIndex(assignments) {
  const match = assignments.match(/(\d+)\s*=/);
  return match ? Number(match[1]) : null;
}

function buildLessonPreview(detail, lesson, index) {
  return {
    id: `${detail.id}-lesson-${index}`,
    title: lesson.lesson,
    description: lesson.interface_notes || lesson.topics,
    sourceLesson: lesson.lesson,
    sourceFile: lesson.file,
    mechanicMentions: lesson.mechanics_mentions,
    pointIndex: extractPrimaryPointIndex(lesson.point_assignments),
  };
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  defaultYasnaId: DEFAULT_YASNA_ID,
  analysisModes: ANALYSIS_MODE_OPTIONS,
  mechanics: MECHANICS,
  mechanicGroups: MECHANIC_GROUPS,
  yasnas: YASNA_DATA.map((record) => {
    const detail = toYasnaDetailView(record);

    return {
      ...detail,
      lessons: detail.lessons.map((lesson, index) => buildLessonPreview(detail, lesson, index)),
    };
  }),
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`Generated GitHub Pages preview snapshot: ${path.relative(projectRoot, outputFile)}`);

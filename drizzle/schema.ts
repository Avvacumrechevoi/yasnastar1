import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const yasnas = mysqlTable(
  "yasnas",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    family: varchar("family", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    lessonCount: int("lessonCount").notNull().default(0),
    mechanicsJson: text("mechanicsJson").notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    familyIdx: index("yasnas_family_idx").on(table.family),
    sortIdx: index("yasnas_sort_idx").on(table.sortOrder),
  }),
);

export const yasnaPoints = mysqlTable(
  "yasna_points",
  {
    id: int("id").autoincrement().primaryKey(),
    yasnaId: varchar("yasnaId", { length: 128 })
      .notNull()
      .references(() => yasnas.id, { onDelete: "cascade" }),
    pointIndex: int("pointIndex").notNull(),
    rawText: text("rawText"),
  },
  table => ({
    yasnaIdx: index("yasna_points_yasna_idx").on(table.yasnaId),
    pointUnique: uniqueIndex("yasna_points_yasna_point_uq").on(table.yasnaId, table.pointIndex),
  }),
);

export const yasnaLessons = mysqlTable(
  "yasna_lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    yasnaId: varchar("yasnaId", { length: 128 })
      .notNull()
      .references(() => yasnas.id, { onDelete: "cascade" }),
    file: varchar("file", { length: 255 }).notNull(),
    lesson: text("lesson").notNull(),
    topics: text("topics").notNull(),
    pointAssignments: text("pointAssignments").notNull(),
    mechanicMentionsJson: text("mechanicMentionsJson").notNull(),
    interfaceNotes: text("interfaceNotes").notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
  },
  table => ({
    yasnaIdx: index("yasna_lessons_yasna_idx").on(table.yasnaId),
    sortIdx: index("yasna_lessons_sort_idx").on(table.sortOrder),
  }),
);

export const yasnaNotes = mysqlTable(
  "yasna_notes",
  {
    id: int("id").autoincrement().primaryKey(),
    yasnaId: varchar("yasnaId", { length: 128 })
      .notNull()
      .references(() => yasnas.id, { onDelete: "cascade" }),
    noteText: text("noteText").notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
  },
  table => ({
    yasnaIdx: index("yasna_notes_yasna_idx").on(table.yasnaId),
    sortIdx: index("yasna_notes_sort_idx").on(table.sortOrder),
  }),
);

export const yasnaMechanics = mysqlTable(
  "yasna_mechanics",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    title: varchar("title", { length: 128 }).notNull(),
    shortTitle: varchar("shortTitle", { length: 128 }).notNull(),
    alias: text("alias"),
    category: mysqlEnum("category", ["Кресты", "Праны", "Оси", "Дуги"]).notNull(),
    kind: mysqlEnum("kind", ["polygon", "line", "arc", "contrast"]).notNull(),
    pointIndicesJson: text("pointIndicesJson").notNull(),
    stroke: varchar("stroke", { length: 128 }).notNull(),
    fill: varchar("fill", { length: 128 }).notNull(),
    glow: varchar("glow", { length: 128 }).notNull(),
    description: text("description").notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    categoryIdx: index("yasna_mechanics_category_idx").on(table.category),
    sortIdx: index("yasna_mechanics_sort_idx").on(table.sortOrder),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Yasna = typeof yasnas.$inferSelect;
export type InsertYasna = typeof yasnas.$inferInsert;
export type YasnaPoint = typeof yasnaPoints.$inferSelect;
export type InsertYasnaPoint = typeof yasnaPoints.$inferInsert;
export type YasnaLessonRow = typeof yasnaLessons.$inferSelect;
export type InsertYasnaLessonRow = typeof yasnaLessons.$inferInsert;
export type YasnaNoteRow = typeof yasnaNotes.$inferSelect;
export type InsertYasnaNoteRow = typeof yasnaNotes.$inferInsert;
export type YasnaMechanicRow = typeof yasnaMechanics.$inferSelect;
export type InsertYasnaMechanicRow = typeof yasnaMechanics.$inferInsert;

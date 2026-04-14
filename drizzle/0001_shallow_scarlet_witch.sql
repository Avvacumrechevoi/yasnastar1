CREATE TABLE `yasna_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yasnaId` varchar(128) NOT NULL,
	`file` varchar(255) NOT NULL,
	`lesson` text NOT NULL,
	`topics` text NOT NULL,
	`pointAssignments` text NOT NULL,
	`mechanicMentionsJson` text NOT NULL,
	`interfaceNotes` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `yasna_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yasna_mechanics` (
	`id` varchar(128) NOT NULL,
	`title` varchar(128) NOT NULL,
	`shortTitle` varchar(128) NOT NULL,
	`alias` text,
	`category` enum('Кресты','Праны','Оси','Дуги') NOT NULL,
	`kind` enum('polygon','line','arc','contrast') NOT NULL,
	`pointIndicesJson` text NOT NULL,
	`stroke` varchar(128) NOT NULL,
	`fill` varchar(128) NOT NULL,
	`glow` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `yasna_mechanics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yasna_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yasnaId` varchar(128) NOT NULL,
	`noteText` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `yasna_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yasna_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yasnaId` varchar(128) NOT NULL,
	`pointIndex` int NOT NULL,
	`rawText` text,
	CONSTRAINT `yasna_points_id` PRIMARY KEY(`id`),
	CONSTRAINT `yasna_points_yasna_point_uq` UNIQUE(`yasnaId`,`pointIndex`)
);
--> statement-breakpoint
CREATE TABLE `yasnas` (
	`id` varchar(128) NOT NULL,
	`family` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`lessonCount` int NOT NULL DEFAULT 0,
	`mechanicsJson` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `yasnas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `yasna_lessons` ADD CONSTRAINT `yasna_lessons_yasnaId_yasnas_id_fk` FOREIGN KEY (`yasnaId`) REFERENCES `yasnas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `yasna_notes` ADD CONSTRAINT `yasna_notes_yasnaId_yasnas_id_fk` FOREIGN KEY (`yasnaId`) REFERENCES `yasnas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `yasna_points` ADD CONSTRAINT `yasna_points_yasnaId_yasnas_id_fk` FOREIGN KEY (`yasnaId`) REFERENCES `yasnas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `yasna_lessons_yasna_idx` ON `yasna_lessons` (`yasnaId`);--> statement-breakpoint
CREATE INDEX `yasna_lessons_sort_idx` ON `yasna_lessons` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `yasna_mechanics_category_idx` ON `yasna_mechanics` (`category`);--> statement-breakpoint
CREATE INDEX `yasna_mechanics_sort_idx` ON `yasna_mechanics` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `yasna_notes_yasna_idx` ON `yasna_notes` (`yasnaId`);--> statement-breakpoint
CREATE INDEX `yasna_notes_sort_idx` ON `yasna_notes` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `yasna_points_yasna_idx` ON `yasna_points` (`yasnaId`);--> statement-breakpoint
CREATE INDEX `yasnas_family_idx` ON `yasnas` (`family`);--> statement-breakpoint
CREATE INDEX `yasnas_sort_idx` ON `yasnas` (`sortOrder`);
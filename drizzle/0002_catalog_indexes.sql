CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `yasna_lessons_yasna_sort_idx` ON `yasna_lessons` (`yasnaId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `yasna_notes_yasna_sort_idx` ON `yasna_notes` (`yasnaId`,`sortOrder`);

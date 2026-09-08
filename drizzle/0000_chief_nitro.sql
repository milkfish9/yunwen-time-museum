CREATE TABLE `ci_works` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`tune` text NOT NULL,
	`topic` text NOT NULL,
	`lines_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ci_works_created_at_idx` ON `ci_works` (`created_at`);
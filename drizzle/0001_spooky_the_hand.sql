CREATE TABLE `board_admin_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`updated_at` integer NOT NULL
);

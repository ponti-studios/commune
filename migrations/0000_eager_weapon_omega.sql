CREATE TABLE `case_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`raw_content` text NOT NULL,
	`neutral_content` text NOT NULL,
	`round` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`raw_situation` text NOT NULL,
	`neutral_situation` text NOT NULL,
	`question` text NOT NULL,
	`quorum_size` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verdicts` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`update_id` text,
	`update_round` integer DEFAULT 0 NOT NULL,
	`fingerprint` text NOT NULL,
	`value` text NOT NULL,
	`comment` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`update_id`) REFERENCES `case_updates`(`id`) ON UPDATE no action ON DELETE cascade
);

-- V10: Rename plan column to user_plan to avoid Hibernate conflict

ALTER TABLE users RENAME COLUMN plan TO user_plan;
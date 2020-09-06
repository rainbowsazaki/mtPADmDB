ALTER TABLE monster_base_data ADD canUnlockExtraSlot INTEGER DEFAULT 0;
UPDATE monster_base_data SET canUnlockExtraSlot = evolutionType IN (3, 6, 7) OR name LIKE '%耳飾り';

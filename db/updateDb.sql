
ALTER TABLE skill ADD COLUMN minTurn INTEGER;

UPDATE skill
  SET minTurn = baseTurn - maxLevel + 1
  WHERE baseTurn IS NOT NULL AND maxLevel IS NOT NULL;


-- maxLevel を削除したいが、 SQLite にはテーブルの項目の削除がないため、
-- 削除したい項目がないテーブルを別途作成して、そこに内容をコピーして元のテーブルを削除する。
CREATE TABLE IF NOT EXISTS skill_copy (
  id INTEGER PRIMARY KEY,
  no INTEGER,
  name TEXT,
  description TEXT,
  baseTurn INTEGER,
  minTurn INTEGER,
  comment TEXT,

	createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER
);

INSERT INTO skill_copy
	SELECT id, no, name, description, baseTurn, minTurn, comment, createdDatetime, ipAddress, accountName, state
	FROM  skill;
	
DROP TABLE skill;
ALTER TABLE skill_copy RENAME TO skill;

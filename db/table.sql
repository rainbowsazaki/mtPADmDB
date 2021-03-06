CREATE TABLE IF NOT EXISTS monster_base_data (
  id INTEGER PRIMARY KEY,
  name TEXT,
  attributes_0 INTEGER,
  attributes_1 INTEGER,
  cost INTEGER,
  rare INTEGER,
  types_0 INTEGER,
  types_1 INTEGER,
  types_2 INTEGER,
  awakens_0 INTEGER,
  awakens_1 INTEGER,
  awakens_2 INTEGER,
  awakens_3 INTEGER,
  awakens_4 INTEGER,
  awakens_5 INTEGER,
  awakens_6 INTEGER,
  awakens_7 INTEGER,
  awakens_8 INTEGER,
  maxExp INTEGER,
  maxLevel INTEGER,
  maxParam_hp INTEGER,
  maxParam_attack INTEGER,
  maxParam_recovery INTEGER,
  skill INTEGER,
  leaderSkill INTEGER,
  assist INTEGER,
  overLimit INTEGER,
  evolutionType INTEGER,
  canUnlockExtraSlot INTEGER
);


CREATE TABLE IF NOT EXISTS over_limit (
  id INTEGER PRIMARY KEY,
  param_hp INTEGER,
  param_attack INTEGER,
  param_recovery INTEGER,
  superAwakens TEXT
);


CREATE TABLE IF NOT EXISTS evolution (
  id INTEGER PRIMARY KEY,
  type INTEGER,
  baseNo INTEGER,
  materials_0 INTEGER,
  materials_1 INTEGER,
  materials_2 INTEGER,
  materials_3 INTEGER,
  materials_4 INTEGER
);

CREATE TABLE IF NOT EXISTS monster_data (
  id INTEGER PRIMARY KEY,
  no INTEGER,
  monster_base_data INTEGER,
  over_limit INTEGER,
  evolution INTEGER,
  comment TEXT,

	createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER
);

CREATE TABLE IF NOT EXISTS skill (
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

CREATE TABLE IF NOT EXISTS leader_skill (
  id INTEGER PRIMARY KEY,
  no INTEGER,
  name TEXT,
  description TEXT,
  comment TEXT,

	createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER
);


  INSERT INTO skill (no , name , description, baseTurn, minTurn, state)
    VALUES (1, '無し','', NULL, NULL, 1);

  INSERT INTO leader_skill (no , name , description, state)
      VALUES (1, '無し','', 1);


CREATE TABLE IF NOT EXISTS monster_image (
  id INTEGER PRIMARY KEY,
  no INTEGER,

  createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER
);


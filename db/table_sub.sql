CREATE TABLE search_result (
  name TEXT PRIMARY KEY,
  digest TEXT,
  
  createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime'))
);

CREATE TABLE bbs_entry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageUrl TEXT,
  pageTitle TEXT,
  name TEXT,
  message TEXT,

  timestamp TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER -- 0 - 削除済み  1 - 有効
);
CREATE TABLE search_result (
  name TEXT PRIMARY KEY,
  digest TEXT,
  
  createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime'))
);

CREATE TABLE bbs_entry (
  pageUrl TEXT,
  pageTitle TEXT,
  name TEXT,
  message TEXT,

  timestamp TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime')),
  ipAddress TEXT,
  accountName TEXT,
  state INTEGER
);
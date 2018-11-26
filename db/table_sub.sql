CREATE TABLE search_result (
  name TEXT PRIMARY KEY,
  digest TEXT,
  
  createdDatetime TIMESTAMP DEFAULT (datetime(CURRENT_TIMESTAMP,'localtime'))
);


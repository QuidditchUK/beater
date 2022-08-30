CREATE EXTENSION pg_trgm;
CREATE EXTENSION btree_gin;

CREATE INDEX user_email_index 
   ON users USING GIN (to_tsvector('english', email));
CREATE INDEX user_first_name_index 
   ON users USING GIN (to_tsvector('english', first_name));
CREATE INDEX user_last_name_index 
   ON users USING GIN (to_tsvector('english', last_name));
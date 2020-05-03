import path from 'path';
import { pgp } from '../modules/pg';

// helper function for linking to external query files
// https://github.com/vitaly-t/pg-promise#query-files
// Second argument can take snippets of SQL to simplify / modularize the queries

export function sql(file, external = {}) {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, {
    minify: true,
    params: external,
    debug: true,
  });
}

export const sqlReadOne = sql('./read-one.sql');
export const sqlUpdateOne = sql('./update-one.sql');
export const sqlSearchClubs = sql('./search-clubs.sql');

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clubs (
    uuid uuid PRIMARY KEY
    , created TIMESTAMPTZ
    , updated TIMESTAMPTZ
    , name varchar(255) NOT NULL UNIQUE
    , slug varchar(255) NOT NULL UNIQUE
    , location geometry(POINT,4326)
    , type varchar(255) NOT NULL
);

INSERT INTO clubs (uuid, created, updated, name, slug, location, league, venue, icon, images) VALUES
    ('91DA3CD8-AEC6-4FFE-957E-320EF991055A', NOW(), NOW(), 'London Quidditch Club', 'london-quidditch-club', ST_GeomFromText('POINT(-0.150805 51.460149)',4326), 'Community', 'Clapham Common', 'image', '{{"https://images.prismic.io/chaser/475578b7-a77c-4abc-90f2-de1547bbacf2_72886220_1438371239645635_5936997713475272704_o.jpg?auto=compress,format"}}'),
    (uuid_generate_v4(), NOW(), NOW(), 'London Unspeakables Quidditch', 'london-unspeakables', ST_GeomFromText('POINT(-0.148176 51.453825)',4326), 'Community', 'Clapham South', 'image', '{{"https://images.prismic.io/chaser/475578b7-a77c-4abc-90f2-de1547bbacf2_72886220_1438371239645635_5936997713475272704_o.jpg?auto=compress,format"}}'),
    (uuid_generate_v4(), NOW(), NOW(), 'Werewolves of London Quidditch Club', 'werewolves-of-london', ST_GeomFromText('POINT(-0.157671 51.558175)',4326), 'Community', 'Hampstead Heath', 'image', '{{"https://images.prismic.io/chaser/475578b7-a77c-4abc-90f2-de1547bbacf2_72886220_1438371239645635_5936997713475272704_o.jpg?auto=compress,format"}}'),
    (uuid_generate_v4(), NOW(), NOW(), 'St Andrews Snidgets Quidditch Club', 'st-andrews-snidgets', ST_GeomFromText('POINT(-2.811808 56.341305)',4326), 'University', 'St Andrews', 'image', '{{"https://images.prismic.io/chaser/475578b7-a77c-4abc-90f2-de1547bbacf2_72886220_1438371239645635_5936997713475272704_o.jpg?auto=compress,format"}}');

INSERT INTO teams (uuid, created, updated, name, short_name, current_division, current_position, club_uuid) VALUES
    (uuid_generate_v4(), NOW(), NOW(), 'London Quidditch Club A', 'LQA', 1, 1, '91DA3CD8-AEC6-4FFE-957E-320EF991055A'),
    (uuid_generate_v4(), NOW(), NOW(), 'London Quidditch Club B', 'LQB', 2, 1, '91DA3CD8-AEC6-4FFE-957E-320EF991055A');

-- Give me all clubs within 100km of me
SELECT * 
FROM clubs 
WHERE ST_DWithin(location, ST_GeomFromText('POINT(-0.146135 51.464211)', 4326)::geography, 100000);

-- Give me all clubs 100km from me, ordered by distance

SELECT uuid, name, ST_Distance(location, ref_geom) AS distance
FROM clubs
CROSS JOIN (SELECT ST_GeomFromText('POINT(-0.157671 51.558175)', 4326)::geography AS ref_geom) AS r
WHERE ST_DWithin(location, ref_geom, 100000)
ORDER BY ST_Distance(location, ref_geom);
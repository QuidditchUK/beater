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

INSERT INTO events (uuid, created, updated, name, venue, icon, start_time, end_time, team_fee, player_fee) VALUES
    (uuid_generate_v4(), NOW(), NOW(), 'Northern Cup 2020', 'Sheffield Park', 'https://images.prismic.io/chaser/65d65868-3e13-4024-871a-6f23d1467042_Northern-Cup-2019-Logo.png?auto=compress,format', '2020-11-14 07:00:00Z', '2020-11-15 17:00:00Z', 10000, 0);

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

INSERT INTO clubs (uuid, created, updated, name, slug, location, league, venue, icon, images, tags, leader, leader_position, featured_color, text_color, description) VALUES
    (
        uuid_generate_v4(),
        NOW(),
        NOW(),
        'Loughborough Longshots',
        'loughborough-longshots',
        ST_GeomFromText('POINT(-1.2336621 52.7648043)',4326),
        'University',
        'Loughborough University',
        'https://images.prismic.io/chaser/dafc4123-cfd0-431b-bdcc-f0679c754394_Logo+New-01+-+Loughborough+Longshots.png?auto=compress,format',
        '{"https://images.prismic.io/chaser/d7a51631-e413-49b4-b3d1-2633dbaa9a6e_53216921_330790634447620_6601668113261920256_n+-+Loughborough+Longshots.jpg?auto=compress,format"}',
        '{"Loughborough Longshots", Loughborough}',
        'Lucy Nicholls',
        'President',
        '#4b2565',
        '#ffffff',
        'The Loughborough Longshots are Loughborough University''s quidditch team, and part of the LSU Harry Potter and Quidditch Society. Since they were founded in 2013, the team have competed at both national and international tournaments.'
    );


    INSERT INTO events (
        uuid
        , created
        , updated
        , name
        , venue
        , icon
        , images
        , start_time
        , end_time
        , team_fee
        , player_fee
        , location
        , description
        , league
    ) VALUES
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'Community Fixture #1'
        , 'The South - TBA'
        , 'https://images.prismic.io/chaser/59b12e9a-447a-420b-8053-89c185a80c48_Community+Division+Logo+Draft+2.0.png?auto=compress,format'
        , '{"https://images.prismic.io/chaser/b0b832df-5dc1-420a-b36b-d1d0ad1a0e5f_57107303_3038304626210443_7855371880167899136_o.jpg?auto=compress,format"}'
        , '2020-10-24 07:00:00Z'
        , '2020-10-24 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-1.1881193 51.6489061)', 4326)
        , '<p>The first QuidditchUK Community League fixture of the 2020/2021 Season. All community teams are eligible to attend and compete in divisions for promotion and relegation for the next fixture. More details to be announced closer to the event.</p>'
        , 'Community'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'Community Fixture #2'
        , 'The North - TBA'
        , 'https://images.prismic.io/chaser/59b12e9a-447a-420b-8053-89c185a80c48_Community+Division+Logo+Draft+2.0.png?auto=compress,format'
        , '{"https://images.prismic.io/chaser/268942b3-1766-4b25-b5b8-4f30259a75b1_southern+2019+-+Mammoths+Quidditch+Club.jpg?auto=compress,format"}'
        , '2021-02-07 07:00:00Z'
        , '2021-02-07 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-2.0037141 52.477564)', 4326)
        , '<p>The second QuidditchUK Community League fixture of the 2020/2021 Season. Community teams compete in divisions for the Community League Cup and to qualify for the British Quidditch Cup. More details to be announced closer to the event.</p>'
        , 'Community'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'University Cup'
        , 'The North - TBA'
        , 'https://images.prismic.io/chaser/e1732a5c-5ca8-4f11-a1fd-0b7501097919_University+Division+Logo+Draft.png?auto=compress,format'
        , '{"https://images.prismic.io/chaser/6afa44c5-6e74-42b9-92d8-9107d81599b9_56938242_3035641903143382_6155265103894675456_o.jpg?auto=compress,format"}'
        , '2020-11-14 07:00:00Z'
        , '2020-11-15 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-2.0037141 52.477564)', 4326)
        , '<p>Opt-in tournament for any University Club to begin the 2020/2021 Season. Has no bearing on BQC Qualification, provides competitive fixture to clubs that can attend. More details to be announced closer to the event.</p>'
        , 'University'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'Northern Cup'
        , 'The North - TBA'
        , 'https://images.prismic.io/chaser/4a75df65-d3a6-4ac2-a554-220330103500_University+Division+Logo+%28The+North+Version%29.png?auto=compress,format'
        , '{"https://images.prismic.io/chaser/f0406a4f-71a2-4f0f-a53d-5b32621e50b1_57198793_3038293639544875_664460994361163776_o+%281%29.jpg?auto=compress,format"}'
        , '2021-02-06 07:00:00Z'
        , '2021-02-06 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-2.0037141 52.477564)', 4326)
        , '<p>University teams split into divisions based on their performance in the 2019/2020 season. Results will determine entry into BQC. More details to be announced closer to the event.</p>'
        , 'University'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'Southerm Cup'
        , 'The South - TBA'
        , 'https://images.prismic.io/chaser/ebf0e5db-cf98-417e-85ef-9cdaa62650d0_University+Division+Logo+%28The+South+Version%29.png?auto=compress,format'
        , '{"https://images.prismic.io/chaser/8315f875-4ae7-44b8-8370-b2b12593760d_IMG_0394.JPG?auto=compress,format"}'
        , '2021-02-20 07:00:00Z'
        , '2021-02-20 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-1.1881193 51.6489061)', 4326)
        , '<p>University teams split into divisions based on their performance in the 2019/2020 season. Results will determine entry into BQC. More details to be announced closer to the event.</p>'
        , 'University'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'Development Cup'
        , 'TBA'
        , ''
        , '{"https://images.prismic.io/chaser/e96e82e8-98a5-4e38-a6f6-86535b8da710_89536699_330857781207062_3898434058144710656_n+-+Manchester+Quidditch.jpg?auto=compress,format"}'
        , '2021-03-27 07:00:00Z'
        , '2021-03-28 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-1.1881193 51.6489061)', 4326)
        , '<p>Community and university teams play each other for the chance to become Development Cup champion. Coaching and refereeing workshops run alongside friendly yet competitive matches at this community-based tournament focused on player development. More details to be announced closer to the event.</p>'
    ),
    (
        uuid_generate_v4()
        , NOW()
        , NOW()
        , 'British Quidditch Club'
        , 'TBA'
        , 'https://images.prismic.io/chaser/e96e82e8-98a5-4e38-a6f6-86535b8da710_89536699_330857781207062_3898434058144710656_n+-+Manchester+Quidditch.jpg?auto=compress,format'
        , '{"https://images.prismic.io/chaser/fc5ae1be-6892-4ed2-891c-e35c21f5ca2c_broomsup-2000x1152.jpg?auto=compress,format"}'
        , '2021-04-17 07:00:00Z'
        , '2021-04-18 17:00:00Z'
        , 0
        , 0
        , ST_GeomFromText('POINT(-1.9821047 52.7367035)', 4326)
        , '<p>The premier event of the UK quidditch season. 12 Community teams compete for the title of British Community Quidditch Champion while 12 University teams compete for the title of British University Quidditch Champion. More details to be announced closer to the event.</p>'
    );
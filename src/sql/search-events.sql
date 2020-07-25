SELECT
  uuid,
  name,
  slug,
  images,
  icon,
  venue,
  league,
  start_time,
  end_time,
  register_time,
  register_link,
  ST_Distance(location, ref_location) AS distance
FROM events
CROSS JOIN (SELECT ST_GeomFromText(${point^}, 4326)::geography AS ref_location) AS r
WHERE ST_DWithin(location, ref_location, ${radius^})
AND league <@ Array[${leagues:list}]::text[]
ORDER BY start_time ASC;
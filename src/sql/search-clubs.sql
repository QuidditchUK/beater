SELECT uuid, name, slug, ST_Distance(location, ref_location) AS distance
FROM clubs
CROSS JOIN (SELECT ST_GeomFromText(${point^}, 4326)::geography AS ref_location) AS r
WHERE ST_DWithin(location, ref_location, ${radius^})
ORDER BY ST_Distance(location, ref_location)
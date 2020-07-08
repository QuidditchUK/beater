INSERT INTO clubs 
  (${data:name}, "location") 
  VALUES (${data:list}, ST_GeomFromText(${point^}, 4326));
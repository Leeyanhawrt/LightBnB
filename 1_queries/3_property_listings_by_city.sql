SELECT properties.id, title, cost_per_night, AVG(rating) 
FROM property_reviews
JOIN properties ON (properties.id = property_reviews.property_id)
WHERE city = 'Vancouver' AND property_reviews.rating > 4
GROUP BY properties.id, title, cost_per_night
ORDER BY cost_per_night ASC
LIMIT 10;

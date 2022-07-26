SELECT reservations.id, properties.title, reservations.start_date, properties.cost_per_night, AVG(property_reviews.rating) AS average_rating
FROM reservations 
JOIN properties ON (reservations.property_id = properties.id)
JOIN users ON (users.id = reservations.guest_id)
JOIN property_reviews ON (property_reviews.property_id = properties.id)
WHERE users.id = 1
GROUP BY reservations.id, properties.title, reservations.start_date, properties.cost_per_night
ORDER BY reservations.start_date ASC
LIMIT 10;
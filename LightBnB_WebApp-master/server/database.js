const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg')

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool.query(`
  SELECT * FROM users
  WHERE users.email = $1`,
    [email])
    .then(data => {
      return data.rows[0]
    })
    .catch(err => {
      return null
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool.query(`
  SELECT * FROM users
  WHERE users.id = $1`,
    [id])
    .then(data => {
      return data.rows[0]
    })
    .catch(err => {
      return null
    });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool.query(`INSERT INTO users
(name, password, email)
VALUES($1, $2, $3)
RETURNING *;`, [user.name, user.password, user.email])
    .then(data => {
      return data.rows[0]
    })
    .catch(err => {
      return null
    })
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool.query(`
  SELECT properties.*, reservations.id, properties.title, reservations.start_date, properties.cost_per_night, AVG(property_reviews.rating) AS average_rating
  FROM reservations 
  JOIN properties ON (reservations.property_id = properties.id)
  JOIN property_reviews ON (property_reviews.property_id = properties.id)
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id, properties.title, reservations.start_date, properties.cost_per_night
  ORDER BY reservations.start_date ASC
  LIMIT $2;`, [guest_id, limit])
    .then(data => {
      return data.rows
    })
    .catch(err => {
      return null
    })
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const queryParams = []
  let queryString =
    `SELECT *, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += ` 
  WHERE city LIKE $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night)
    queryString += ` AND cost_per_night > $${queryParams.length}`
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id)
    queryString += ` AND owner_id = $${queryParams.length}`
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night)
    queryString += ` AND cost_per_night < $${queryParams.length}`
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating)
    queryString += ` AND rating >= $${queryParams.length}`
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams)

  return pool.query(queryString, queryParams)
    .then((data) => {
      console.log(data)
      return data.rows[0]
    })
    .catch((err) => {
      return null
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
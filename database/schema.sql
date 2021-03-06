CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  last_edited INT
);

CREATE TABLE files(
  id SERIAL PRIMARY KEY,
  owner INT REFERENCES users(id),
  name VARCHAR NOT NULL,
  created TIMESTAMP NOT NULL,
  last_modified TIMESTAMP NOT NULL,
  markdown VARCHAR
);

INSERT INTO users(name, password) VALUES ('PUBLIC', 'INSECURE_IMPLEMENTATION');

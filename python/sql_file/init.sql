DROP TABLE IF EXISTS attraction;

CREATE TABLE attraction (
    attraction_id integer PRIMARY KEY ASC,
    nom text NOT NULL,
    description text NOT NULL,
    difficulte integer,
    visible boolean DEFAULT true
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id integer PRIMARY KEY ASC,
    name text NOT NULL,
    password text NOT NULL
);

DROP TABLE IF EXISTS critiques;

CREATE TABLE critiques (
    critique_id integer PRIMARY KEY AUTOINCREMENT,
    note integer,
    commentaire text,
    attraction_id integer,
    user_id integer,
    FOREIGN KEY(attraction_id) REFERENCES attraction(attraction_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
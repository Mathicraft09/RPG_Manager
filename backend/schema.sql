DROP IF EXISTS personnages;


CREATE TABLE personnages (
    id       SERIAL PRIMARY KEY,
    nom      VARCHAR(100) NOT NULL,
    classe   VARCHAR(50),
    niveau   INTEGER DEFAULT 1 CHECK (niveau >= 1),
    pv       INTEGER,
    attaque  INTEGER,
    defense  INTEGER
);
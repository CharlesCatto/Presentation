-- SQLBook: Code
CREATE TABLE user (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    birthdate DATE,
    phone_number VARCHAR(20),
    sold INT DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE motor (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE brand (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE event (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM(
        'salon',
        'course',
        'musée',
        'vente aux enchères',
        'roadtrip',
        'rassemblement',
        'autre'
    ) NOT NULL,
    event_picture VARCHAR(255),
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    location POINT NOT NULL,
    address VARCHAR(255) NOT NULL,
    description VARCHAR(225),
    link VARCHAR(255),
    user_id INT unsigned NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    SPATIAL INDEX (location)
);

CREATE TABLE model (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    brand_id INT unsigned NOT NULL,
    motor_id INT unsigned NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brand (id),
    FOREIGN KEY (motor_id) REFERENCES motor (id)
);

CREATE TABLE marker (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    position POINT NOT NULL,
    label VARCHAR(255),
    details JSON,
    image_path VARCHAR(255) DEFAULT 'uploads/default-marker-img.png',
    user_id INT unsigned NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    SPATIAL INDEX (position)
);

CREATE TABLE vehicle (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    vehicle_picture VARCHAR(255),
    type ENUM('moto', 'voiture') NOT NULL,
    status ENUM(
        'vente',
        'essai',
        'indisponible'
    ) NOT NULL,
    energy ENUM(
        'essence',
        'diesel',
        'electrique'
    ) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    user_id INT unsigned NOT NULL,
    year INT NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE favoris (
    id INT unsigned PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT unsigned NOT NULL,
    marker_id INT unsigned NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (marker_id) REFERENCES marker (id),
    UNIQUE KEY unique_user_marker (user_id, marker_id)
);

insert into
    user (
        id,
        username,
        email,
        password,
        profile_picture,
        firstname,
        lastname,
        birthdate,
        phone_number,
        sold,
        is_admin
    )
values (
        1,
        'admin',
        'admin@vroom.com',
        '$argon2id$v=19$m=65536,t=3,p=4$DDXkvDxw3PNiSIg8/cn67g$m/GhPrYzwGOUidcSPJ8XnmB0OUHAw9quzdMDyJIT30Y',
        'person_15439869.png',
        'admin',
        'admin',
        '1990-01-01',
        '+33601020304',
        100,
        true
    ),
    (
        2,
        'Aldup',
        'alice@example.com',
        '$argon2id$v=19$m=65536,t=3,p=4$DDXkvDxw3PNiSIg8/cn67g$m/GhPrYzwGOUidcSPJ8XnmB0OUHAw9quzdMDyJIT30Y',
        'person_15439869.png',
        'Alice',
        'Dupont',
        '2001-01-01',
        '+33601020304',
        2,
        false
    ),
    (
        3,
        'The B',
        'bob@example.com',
        '$argon2id$v=19$m=65536,t=3,p=4$DDXkvDxw3PNiSIg8/cn67g$m/GhPrYzwGOUidcSPJ8XnmB0OUHAw9quzdMDyJIT30Y',
        'person_15439869.png',
        'Bob',
        'Martin',
        '2001-01-01',
        '+33601020311',
        1,
        false
    );

insert into
    vehicle (
        vehicle_picture,
        type,
        status,
        location,
        latitude,
        longitude,
        energy,
        user_id,
        year,
        brand,
        model
    )
values (
        'https://abcmoteur.fr/wp-content/uploads/2012/07/skyline-c10-gtr-1970.jpg',
        'voiture',
        'vente',
        "paris",
        48.866667,
        2.333333,
        'essence',
        2,
        1970,
        "Nissan",
        'skyline r34 GT-R'
    ),
    (
        'https://www.largus.fr/images/images/audi-a4-2020-1.jpg',
        'voiture',
        'essai',
        "lille",
        50.633333,
        3.066667,
        'essence',
        3,
        2020,
        "Harley-Davidson",
        '8 - XR750'
    );

INSERT INTO
    marker (
        position,
        label,
        details,
        user_id
    )
VALUES (
        POINT(48.8566, 2.3522),
        'Paris',
        '{"eventType":"voiture"}',
        1
    ),
    (
        POINT(51.5074, 0.1278),
        'London',
        '{"eventType":"moto"}',
        2
    );

-- Supprimez les anciens INSERT si existants
DELETE FROM marker;

-- markers Lille
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(50.633596, 3.0703871),
        'Rue Gustave-Delory, Lille',
        '{"eventType":"voiture","brand":"Peugeot","model":"208","year":2022,"date":"2025-06-01","address":"Rue Gustave-Delory, Lille","isSingleDay":true,"duration":"2025-06-01"}',
        'uploads/events/lille1.jpg',
        1
    ),
    (
        POINT(50.6243, 3.0612),
        'Rue Barthélémy-Delespaul, Lille',
        '{"eventType":"moto","brand":"Yamaha","model":"MT-07","year":2021,"date":"2025-06-02","address":"Rue Barthélémy-Delespaul, Lille","isSingleDay":true,"duration":"2025-06-02"}',
        'uploads/events/lille2.jpg',
        2
    ),
    (
        POINT(50.6266, 3.0666),
        'Rue de Bruxelles, Lille',
        '{"eventType":"voiture","brand":"Renault","model":"Clio","year":2020,"date":"2025-06-03","address":"Rue de Bruxelles, Lille","isSingleDay":true,"duration":"2025-06-03"}',
        'uploads/events/lille3.jpg',
        3
    ),
    (
        POINT(50.644309, 3.059543),
        'Rue des Archives, Lille',
        '{"eventType":"moto","brand":"Kawasaki","model":"Z650","year":2023,"date":"2025-06-04","address":"Rue des Archives, Lille","isSingleDay":true,"duration":"2025-06-04"}',
        'uploads/events/lille4.jpg',
        1
    ),
    (
        POINT(50.6383, 3.068733),
        'Rue du Lombard, Lille',
        '{"eventType":"voiture","brand":"Citroën","model":"C3","year":2021,"date":"2025-06-05","address":"Rue du Lombard, Lille","isSingleDay":true,"duration":"2025-06-05"}',
        'uploads/events/lille5.jpg',
        2
    ),
    (
        POINT(50.63053, 3.056133),
        'Rue Solférino, Lille',
        '{"eventType":"moto","brand":"Honda","model":"CB500F","year":2019,"date":"2025-06-06","address":"Rue Solférino, Lille","isSingleDay":true,"duration":"2025-06-06"}',
        'uploads/events/lille6.jpg',
        3
    ),
    (
        POINT(50.6356, 3.071),
        'Rue de Tournai, Lille',
        '{"eventType":"voiture","brand":"Volkswagen","model":"Golf","year":2023,"date":"2025-06-07","address":"Rue de Tournai, Lille","isSingleDay":true,"duration":"2025-06-07"}',
        'uploads/events/lille7.jpg',
        1
    ),
    (
        POINT(50.63694, 3.07314),
        'Avenue Willy Brandt, Lille',
        '{"eventType":"moto","brand":"Ducati","model":"Monster","year":2022,"date":"2025-06-08","address":"Avenue Willy Brandt, Lille","isSingleDay":true,"duration":"2025-06-08"}',
        'uploads/events/lille8.jpg',
        2
    ),
    (
        POINT(50.6167, 3.1666),
        'Villeneuve-d\'Ascq',
        '{"eventType":"voiture","brand":"Tesla","model":"Model 3","year":2024,"date":"2025-06-09","address":"Villeneuve-d\'Ascq","isSingleDay":true,"duration":"2025-06-09"}',
        'uploads/events/lille9.jpg',
        3
    ),
    (
        POINT(50.637, 3.063),
        'Place du Général de Gaulle, Lille',
        '{"eventType":"moto","brand":"Triumph","model":"Street Triple","year":2021,"date":"2025-06-10","address":"Place du Général de Gaulle, Lille","isSingleDay":true,"duration":"2025-06-10"}',
        'uploads/events/lille10.jpg',
        1
    );

-- markers France
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(48.8566, 2.3522),
        'Paris',
        '{"eventType":"voiture","brand":"Renault","model":"Clio","year":2023,"date":"2025-06-11","address":"Paris","isSingleDay":true,"duration":"2025-06-11"}',
        'uploads/events/paris.jpg',
        1
    ),
    (
        POINT(43.2965, 5.3698),
        'Marseille',
        '{"eventType":"moto","brand":"Yamaha","model":"MT-07","year":2022,"date":"2025-06-12","address":"Marseille","isSingleDay":true,"duration":"2025-06-12"}',
        'uploads/events/marseille.jpg',
        2
    ),
    (
        POINT(45.7640, 4.8357),
        'Lyon',
        '{"eventType":"voiture","brand":"Peugeot","model":"208","year":2021,"date":"2025-06-13","address":"Lyon","isSingleDay":true,"duration":"2025-06-13"}',
        'uploads/events/lyon.jpg',
        3
    ),
    (
        POINT(43.6047, 1.4442),
        'Toulouse',
        '{"eventType":"moto","brand":"Honda","model":"CB500F","year":2020,"date":"2025-06-14","address":"Toulouse","isSingleDay":true,"duration":"2025-06-14"}',
        'uploads/events/toulouse.jpg',
        1
    ),
    (
        POINT(43.7102, 7.2620),
        'Nice',
        '{"eventType":"voiture","brand":"Citroën","model":"C3","year":2022,"date":"2025-06-15","address":"Nice","isSingleDay":true,"duration":"2025-06-15"}',
        'uploads/events/nice.jpg',
        2
    ),
    (
        POINT(47.2184, -1.5536),
        'Nantes',
        '{"eventType":"moto","brand":"Kawasaki","model":"Z650","year":2023,"date":"2025-06-16","address":"Nantes","isSingleDay":true,"duration":"2025-06-16"}',
        'uploads/events/nantes.jpg',
        3
    ),
    (
        POINT(48.5734, 7.7521),
        'Strasbourg',
        '{"eventType":"voiture","brand":"Volkswagen","model":"Golf","year":2020,"date":"2025-06-17","address":"Strasbourg","isSingleDay":true,"duration":"2025-06-17"}',
        'uploads/events/strasbourg.jpg',
        1
    ),
    (
        POINT(44.8378, -0.5792),
        'Bordeaux',
        '{"eventType":"moto","brand":"Ducati","model":"Monster","year":2021,"date":"2025-06-18","address":"Bordeaux","isSingleDay":true,"duration":"2025-06-18"}',
        'uploads/events/bordeaux.jpg',
        2
    ),
    (
        POINT(43.6111, 3.8767),
        'Montpellier',
        '{"eventType":"voiture","brand":"Tesla","model":"Model 3","year":2024,"date":"2025-06-19","address":"Montpellier","isSingleDay":true,"duration":"2025-06-19"}',
        'uploads/events/montpellier.jpg',
        3
    ),
    (
        POINT(49.4431, 1.0993),
        'Rouen',
        '{"eventType":"moto","brand":"Triumph","model":"Street Triple","year":2022,"date":"2025-06-20","address":"Rouen","isSingleDay":true,"duration":"2025-06-20"}',
        'uploads/events/rouen.jpg',
        1
    ),
    (
        POINT(48.1113, -1.6808),
        'Rennes',
        '{"eventType":"voiture","brand":"Ford","model":"Focus","year":2021,"date":"2025-06-21","address":"Rennes","isSingleDay":true,"duration":"2025-06-21"}',
        'uploads/events/rennes.jpg',
        2
    ),
    (
        POINT(49.2583, 4.0317),
        'Reims',
        '{"eventType":"moto","brand":"Suzuki","model":"SV650","year":2020,"date":"2025-06-22","address":"Reims","isSingleDay":true,"duration":"2025-06-22"}',
        'uploads/events/reims.jpg',
        3
    ),
    (
        POINT(49.4944, 0.1079),
        'Le Havre',
        '{"eventType":"voiture","brand":"Opel","model":"Corsa","year":2023,"date":"2025-06-23","address":"Le Havre","isSingleDay":true,"duration":"2025-06-23"}',
        'uploads/events/le_havre.jpg',
        1
    ),
    (
        POINT(45.1885, 5.7245),
        'Grenoble',
        '{"eventType":"moto","brand":"BMW","model":"F 900 R","year":2022,"date":"2025-06-24","address":"Grenoble","isSingleDay":true,"duration":"2025-06-24"}',
        'uploads/events/grenoble.jpg',
        2
    ),
    (
        POINT(47.3220, 5.0415),
        'Dijon',
        '{"eventType":"voiture","brand":"Mazda","model":"3","year":2021,"date":"2025-06-25","address":"Dijon","isSingleDay":true,"duration":"2025-06-25"}',
        'uploads/events/dijon.jpg',
        3
    ),
    (
        POINT(43.8367, 4.3601),
        'Nîmes',
        '{"eventType":"moto","brand":"Harley-Davidson","model":"Iron 883","year":2020,"date":"2025-06-26","address":"Nîmes","isSingleDay":true,"duration":"2025-06-26"}',
        'uploads/events/nimes.jpg',
        1
    ),
    (
        POINT(43.1242, 5.9280),
        'Toulon',
        '{"eventType":"voiture","brand":"Audi","model":"A3","year":2023,"date":"2025-06-27","address":"Toulon","isSingleDay":true,"duration":"2025-06-27"}',
        'uploads/events/toulon.jpg',
        2
    ),
    (
        POINT(47.4784, -0.5632),
        'Angers',
        '{"eventType":"moto","brand":"KTM","model":"Duke 390","year":2021,"date":"2025-06-28","address":"Angers","isSingleDay":true,"duration":"2025-06-28"}',
        'uploads/events/angers.jpg',
        3
    ),
    (
        POINT(45.7640, 4.8357),
        'Lyon',
        '{"eventType":"voiture","brand":"Mercedes-Benz","model":"A-Class","year":2022,"date":"2025-06-29","address":"Lyon","isSingleDay":true,"duration":"2025-06-29"}',
        'uploads/events/lyon2.jpg',
        1
    ),
    (
        POINT(43.2965, 5.3698),
        'Marseille',
        '{"eventType":"moto","brand":"Yamaha","model":"MT-09","year":2023,"date":"2025-06-30","address":"Marseille","isSingleDay":true,"duration":"2025-06-30"}',
        'uploads/events/marseille2.jpg',
        2
    ),
    (
        POINT(48.5734, 7.7521),
        'Strasbourg',
        '{"eventType":"voiture","brand":"Skoda","model":"Octavia","year":2021,"date":"2025-07-01","address":"Strasbourg","isSingleDay":true,"duration":"2025-07-01"}',
        'uploads/events/strasbourg2.jpg',
        3
    ),
    (
        POINT(43.6047, 1.4442),
        'Toulouse',
        '{"eventType":"moto","brand":"Honda","model":"CB650R","year":2022,"date":"2025-07-02","address":"Toulouse","isSingleDay":true,"duration":"2025-07-02"}',
        'uploads/events/toulouse2.jpg',
        1
    ),
    (
        POINT(44.8378, -0.5792),
        'Bordeaux',
        '{"eventType":"voiture","brand":"Renault","model":"Megane","year":2020,"date":"2025-07-03","address":"Bordeaux","isSingleDay":true,"duration":"2025-07-03"}',
        'uploads/events/bordeaux2.jpg',
        2
    ),
    (
        POINT(47.2184, -1.5536),
        'Nantes',
        '{"eventType":"moto","brand":"Ducati","model":"Scrambler","year":2021,"date":"2025-07-04","address":"Nantes","isSingleDay":true,"duration":"2025-07-04"}',
        'uploads/events/nantes2.jpg',
        3
    ),
    (
        POINT(43.7102, 7.2620),
        'Nice',
        '{"eventType":"voiture","brand":"Peugeot","model":"308","year":2023,"date":"2025-07-05","address":"Nice","isSingleDay":true,"duration":"2025-07-05"}',
        'uploads/events/nice2.jpg',
        1
    ),
    (
        POINT(48.8566, 2.3522),
        'Paris',
        '{"eventType":"moto","brand":"BMW","model":"R NineT","year":2022,"date":"2025-07-06","address":"Paris","isSingleDay":true,"duration":"2025-07-06"}',
        'uploads/events/paris2.jpg',
        2
    );

-- Événement 1 : Salon Auto Hebdomadaire
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(48.8566, 2.3522), -- Paris
        'Salon Auto Paris',
        '{
        "eventType": "event",
        "date": "2025-06-11 to 2025-06-13",
        "address": "Porte de Versailles, Paris",
        "isSingleDay": false,
        "duration": "Tous les mardis",
        "description": "Le plus grand salon auto de France"
    }',
        'uploads/events/salon-auto.jpg',
        1 -- ID admin
    );

-- Événement 2 : Rallye Mensuel
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(43.2965, 5.3698), -- Marseille
        'Rallye Marseille',
        '{
        "eventType": "event",
        "date": "2025-06-15",
        "address": "Vieux Port, Marseille",
        "isSingleDay": false,
        "duration": "Tous les jeudis",
        "description": "Rallye historique en bord de mer"
    }',
        'uploads/events/rallye.jpg',
        1
    );

-- Événement 3 : Exposition Vintage
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(45.7640, 4.8357), -- Lyon
        'Expo Véhicules Vintage',
        '{
        "eventType": "event",
        "date": "2025-06-20 to 2025-06-22",
        "address": "Place Bellecour, Lyon",
        "isSingleDay": false,
        "duration": "Tous les derniers week-ends",
        "description": "Collection de voitures anciennes"
    }',
        'uploads/events/vintage.jpg',
        1
    );

-- Événement 4 : Drift Show Montpellier
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(43.6119, 3.8777), -- Montpellier
        'Drift Show Montpellier',
        '{
        "eventType": "event",
        "date": "2025-07-05 to 2025-07-06",
        "address": "Zénith Sud, Montpellier",
        "isSingleDay": false,
        "duration": "Premier week-end du mois",
        "description": "Spectacle de drift avec pilotes pros"
    }',
        'uploads/events/drift.jpg',
        1
    );

-- Événement 5 : Tuning Fest Nice
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(43.7102, 7.2620), -- Nice
        'Tuning Fest Nice',
        '{
        "eventType": "event",
        "date": "2025-07-12 to 2025-07-13",
        "address": "Promenade des Anglais, Nice",
        "isSingleDay": false,
        "duration": "Deuxième week-end du mois",
        "description": "Rencontre tuning et son auto"
    }',
        'uploads/events/tuning.jpg',
        1
    );

-- Événement 6 : Classic Car Dijon
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(47.3220, 5.0415), -- Dijon
        'Classic Car Dijon',
        '{
        "eventType": "event",
        "date": "2025-07-19 to 2025-07-21",
        "address": "Parc des Expositions, Dijon",
        "isSingleDay": false,
        "duration": "Troisième week-end du mois",
        "description": "Voitures de collection et passionnés"
    }',
        'uploads/events/classic.jpg',
        1
    );

-- Événement 7 : Salon Moto Strasbourg
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(48.5734, 7.7521), -- Strasbourg
        'Salon Moto Strasbourg',
        '{
        "eventType": "event",
        "date": "2025-07-25 to 2025-07-27",
        "address": "Wacken, Strasbourg",
        "isSingleDay": false,
        "duration": "Dernier week-end du mois",
        "description": "Motos, équipements et nouveautés"
    }',
        'uploads/events/moto.jpg',
        1
    );

-- Événement 8 : Électro Auto Nantes
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(47.2184, -1.5536), -- Nantes
        'Électro Auto Nantes',
        '{
        "eventType": "event",
        "date": "2025-08-03 to 2025-08-04",
        "address": "Parc de la Beaujoire, Nantes",
        "isSingleDay": false,
        "duration": "Premier dimanche et lundi du mois",
        "description": "Salon dédié aux véhicules électriques"
    }',
        'uploads/events/electro.jpg',
        1
    );

-- Événement 9 : Track Day Lille
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(50.6292, 3.0573), -- Lille
        'Track Day Lille',
        '{
        "eventType": "event",
        "date": "2025-08-10",
        "address": "Circuit des Hauts-de-France, Lille",
        "isSingleDay": false,
        "duration": "Chaque deuxième dimanche",
        "description": "Journée de roulage ouverte aux amateurs"
    }',
        'uploads/events/track.jpg',
        1
    );

-- Événement 10 : Auto Culture Toulouse
INSERT INTO
    marker (
        position,
        label,
        details,
        image_path,
        user_id
    )
VALUES (
        POINT(43.6045, 1.4442), -- Toulouse
        'Auto Culture Toulouse',
        '{
        "eventType": "event",
        "date": "2025-08-17 to 2025-08-18",
        "address": "Parc des Expos, Toulouse",
        "isSingleDay": false,
        "duration": "Mi-août chaque année",
        "description": "Exposition et conférences sur l’histoire automobile"
    }',
        'uploads/events/culture.jpg',
        1
    );
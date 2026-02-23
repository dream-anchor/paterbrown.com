-- Update ticket_url for all KBA tour events with city-specific Eventim links
-- Each URL includes affiliate tracking parameters

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-alte-kongresshalle-muenchen-20792306/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'München' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-friedrich-ebert-halle-20783148/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Hamburg' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-volkshaus-20823961/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Zürich' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-stadthalle-baunatal-21273201/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Baunatal' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-kongresshalle-giessen-21275545/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Gießen' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-volksbuehne-am-rudolfplatz-21275989/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Köln' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-theaterhaus-am-pragsattel-21276299/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Stuttgart' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-kornhaus-kempten-21302835/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Kempten' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-stadthalle-erding-21325164/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Erding' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-kupfersaal-21276838/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Leipzig' AND source IS DISTINCT FROM 'KL';

UPDATE tour_events SET ticket_url = 'https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-berliner-kabarett-theater-die-wuehlmaeuse-21321777/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp'
WHERE city = 'Berlin' AND source IS DISTINCT FROM 'KL';

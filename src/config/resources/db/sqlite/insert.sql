-- Copyright (C) 2023 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- "Konzeption und Realisierung eines aktiven Datenbanksystems"
-- "Verteilte Komponenten und Datenbankanbindung"
-- "Design Patterns"
-- "Freiburger Chorfilm"
-- "Maschinelle Lernverfahren zur Behandlung von Bonitätsrisiken im Mobilfunkgeschäft"
-- "Software Pioneers"

INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (1,0,'1881-66C7-3420-0000',4,'SCIENCE-FICTION',11.1,0.011,true,'2022-02-01','https://acme.at','JAVASCRIPT','2022-02-01 00:00:00','2022-02-01 00:00:00');
INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (20,0,'1881-66C7-3420-0001',2,'ACTION',22.2,0.022,true,'2022-02-02','https://acme.biz','TYPESCRIPT','2022-02-02 00:00:00','2022-02-02 00:00:00');
INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (30,0,'1881-66C7-3420-0002',3,'ACTION',33.3,0.033,true,'2022-02-03','https://acme.com','JAVASCRIPT,TYPESCRIPT','2022-02-03 00:00:00','2022-02-03 00:00:00');
INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (40,0,'1881-66C7-3420-0003',4,'HORROR',44.4,0.044,true,'2022-02-04','https://acme.de',null,'2022-02-04 00:00:00','2022-02-04 00:00:00');
INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (50,0,'1881-66C7-3420-0004',2,'ACTION',55.5,0.055,true,'2022-02-05','https://acme.es','TYPESCRIPT','2022-02-05 00:00:00','2022-02-05 00:00:00');
INSERT INTO film(id, version, isan, rating, genre, preis, rabatt, lieferbar, datum, homepage, schlagwoerter, erzeugt, aktualisiert) VALUES
    (60,0,'1881-66C7-3420-0005',1,'FANTASY',66.6,0.066,true,'2022-02-06','https://acme.fi','TYPESCRIPT','2022-02-06 00:00:00','2022-02-06 00:00:00');

INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (1,'Alpha','alpha',1);
INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (20,'Beta',null,20);
INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (30,'Gamma','gamma',30);
INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (40,'Delta','delta',40);
INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (50,'Epsilon','epsilon',50);
INSERT INTO titel(id, titel, untertitel, film_id) VALUES
    (60,'Phi','phi',60);

INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (1,'Alpha','Müller',1);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (20,'Beta','Morgen',20);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (21,'Karl','Marx',20);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (30,'Gamma','Morgenstern',30);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (31,'Johannes','Bibus',30);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (40,'Delta','Univ',40);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (50,'Epsilon','Aristoteles',50);
INSERT INTO schauspieler(id, vorname, nachname, film_id) VALUES
    (60,'Phi','Sokrates',60);

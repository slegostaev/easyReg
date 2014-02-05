# --- !Ups


insert into units (id, name, start_work, end_work) values (1, 'Зубы и десны', '09:00:00', '20:00:00');

insert into doctors (id, last_name, first_name, unit_id, is_active) values (1, 'Ivanov', 'Ivan', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (2, 'Petrov', 'Alex', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (3, 'Sidorov', 'Sergey', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (4, 'Fadeev', 'Petr', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (5, 'Pushkin', 'Denis', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (6, 'Tolsloy', 'Andrey', 1, true);
insert into doctors (id, last_name, first_name, unit_id, is_active) values (7, 'Legostaeva', 'Mary', 1, true);

insert into patients (id, last_name, first_name, is_active) values (1, 'Komarov', 'Sergey', true);
insert into patients (id, last_name, first_name, is_active) values (2, 'Orlov', 'Pavel', true);
insert into patients (id, last_name, first_name, is_active) values (3, 'Popov', 'Vova', true);
insert into patients (id, last_name, first_name, is_active) values (4, 'Ivanova', 'Polina', true);
insert into patients (id, last_name, first_name, is_active) values (5, 'Smirnov', 'Sergey', true);
insert into patients (id, last_name, first_name, is_active) values (6, 'Malikov', 'Andrey', true);
insert into patients (id, last_name, first_name, is_active) values (7, 'Konev', 'Alexand', true);
insert into patients (id, last_name, first_name, is_active) values (8, 'Abramov', 'Alexey', true);
insert into patients (id, last_name, first_name, is_active) values (9, 'Fedorova', 'Natash', true);
insert into patients (id, last_name, first_name, is_active) values (10, 'Fetisov', 'Vyacheslav', true);
insert into patients (id, last_name, first_name, is_active) values (11, 'Bobrov', 'Maxim', true);
insert into patients (id, last_name, first_name, is_active) values (12, 'Kuznecov', 'Evegeny', true);
insert into patients (id, last_name, first_name, is_active) values (14, 'Gogol', 'Nikolay', true);
insert into patients (id, last_name, first_name, is_active) values (15, 'Torhova', 'Katya', true);

insert into chairs (id, location, unit_id) values (1, 'Kab 1', 1);
insert into chairs (id, location, unit_id) values (2, 'Kab 2', 1);
insert into chairs (id, location, unit_id) values (3, 'Kab 3 left', 1);
insert into chairs (id, location, unit_id) values (4, 'Kab 4', 1);
insert into chairs (id, location, unit_id) values (5, 'Kab 3 right', 1);



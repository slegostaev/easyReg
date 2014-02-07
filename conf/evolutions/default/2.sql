# --- !Ups


insert into units (id, name, start_work, end_work) values (1, 'Зубы и десны', '09:00:00', '20:00:00');

insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (1, 'Иванов', 'Иван', 'Иванович', '1975-01-23', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (2, 'Петров', 'Александр', 'Петрович', '1970-12-1', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (3, 'Петров', 'Сергей', 'Семенович', '1980-10-12', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (4, 'Фадеев', 'Петр', 'Фадеевич', '1985-03-30', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (5, 'Пушкин', 'Денис', 'Васильевич', '1981-09-17', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (6, 'Толстой', 'Андрей', 'Викторович', '1965-03-11', 1, true);
insert into doctors (id, surname, first_name, patronymic, birthday, unit_id, is_active) values (7, 'Легостаева', 'Мария', 'Сергеевна', '1972-02-19', 1, true);

insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (1, 'Комаров', 'Сергей', 'Андреевич', '1972-02-9', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (2, 'Орлов', 'Павел', 'Петрович', '1970-05-10', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (3, 'Попов', 'Владимир', 'Владимирович', '1978-07-19', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (4, 'Попов', 'Владимир', 'Семенович', '1960-09-11', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (5, 'Смирнов', 'Сергей', 'Анатольевич', '1969-11-29', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (6, 'Маликов', 'Андрей', 'Викторович', '1945-10-14', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (7, 'Конев', 'Александр', 'Александрович', '1957-11-10', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (8, 'Абрамов', 'Алексей', 'Андреевич', '1981-01-01', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (9, 'Крылов', 'Евгений', ' Леонидович', '1982-02-15', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (10, 'Фетисов', 'Павел', 'Петрович', '1989-05-12', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (11, 'Бобров', 'Максим', 'Сергеевич', '1994-06-17', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (12, 'Кузнецов', 'Роман', 'Васильевич', '1990-07-03', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (14, 'Гоголь', 'Николай', 'Васильевич', '1984-03-12', true);
insert into patients (id, surname, first_name, patronymic, birthday, is_active) values (15, 'Торхова', 'Екатерина', 'Ивановна', '1953-02-19', true);

insert into chairs (id, location, unit_id) values (1, 'Kab 1', 1);
insert into chairs (id, location, unit_id) values (2, 'Kab 2', 1);
insert into chairs (id, location, unit_id) values (3, 'Kab 3 left', 1);
insert into chairs (id, location, unit_id) values (4, 'Kab 4', 1);
insert into chairs (id, location, unit_id) values (5, 'Kab 3 right', 1);



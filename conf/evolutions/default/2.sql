# --- !Ups


insert into units (id, name, start_work, end_work) values (1, 'Зубы и десны', '09:00:00', '20:00:00');

insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (1, 'Иванов', 'Иван', 'Иванович', '1975-01-23', 1, 'Иванов Иван Иванович');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (2, 'Петров', 'Александр', 'Петрович', '1970-12-1', 1, 'Петров Александ Петрович');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (3, 'Петров', 'Сергей', 'Семенович', '1980-10-12', 1, 'Петров Сергей Семенович');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (4, 'Фадеев', 'Петр', 'Фадеевич', '1985-03-30', 1, 'Фадеев Петр Фадеевич');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (5, 'Пушкин', 'Денис', 'Васильевич', '1981-09-17', 1, 'Пушкин Денис Васильвич');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (6, 'Толстой', 'Андрей', 'Викторович', '1965-03-11', 1, 'Толстой Андрей Викторович');
insert into doctors (id, surname, firstname, patronymic, birthday, unit_id, fullname) 
	values (7, 'Легостаева', 'Мария', 'Сергеевна', '1972-02-19', 1, 'Легостаева Мария Сергеевна');

insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (10, 'Комаров', 'Сергей', 'Андреевич', '1972-02-9', today, today, 'Комаров Сергей Андреевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (20, 'Орлов', 'Павел', 'Петрович', '1970-05-10', today, today, 'Орлов Павел Петрович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (30, 'Попов', 'Владимир', 'Владимирович', '1978-07-19', today, today, 'Попов Владимир Владимирович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (40, 'Попов', 'Владимир', 'Семенович', '1960-09-11', today, today, 'Попов Владимир Семенович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (50, 'Смирнов', 'Сергей', 'Анатольевич', '1969-11-29', today, today, 'Смирнов Сергей Анатольевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (60, 'Маликов', 'Андрей', 'Викторович', '1945-10-14', today, today, 'Маликов Андрей Викторович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (70, 'Конев', 'Александр', 'Александрович', '1957-11-10', today, today, 'Конев Александр Александрович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (80, 'Абрамов', 'Алексей', 'Андреевич', '1981-01-01', today, today, 'Абрамов Алексей Андреевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (90, 'Крылов', 'Евгений', ' Леонидович', '1982-02-15', today, today, 'Крылов Евгений Леонидович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (100, 'Фетисов', 'Павел', 'Петрович', '1989-05-12', today, today, 'Фетисов Павел Петрович');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (110, 'Бобров', 'Максим', 'Сергеевич', '1994-06-17', today, today, 'Бобров Максим Сергеевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (120, 'Кузнецов', 'Роман', 'Васильевич', '1990-07-03', today, today, 'Кузнецов Роман Васильевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (140, 'Гоголь', 'Николай', 'Васильевич', '1984-03-12', today, today, 'Гоголь Николай Васильевич');
insert into patients (id, surname, firstname, patronymic, birthday, CREATE_DATE, UPDATED_DATE, fullname) 
	values (150, 'Торхова', 'Екатерина', 'Ивановна', '1953-02-19', today, today, 'Торхова Екатерина Ивановна');

insert into chairs (id, location, unit_id, CREATE_DATE, UPDATED_DATE) values (1, 'Kab 1', 1, today, today);
insert into chairs (id, location, unit_id, CREATE_DATE, UPDATED_DATE) values (2, 'Kab 2', 1, today, today);
insert into chairs (id, location, unit_id, CREATE_DATE, UPDATED_DATE) values (3, 'Kab 3 left', 1, today, today);
insert into chairs (id, location, unit_id, CREATE_DATE, UPDATED_DATE) values (4, 'Kab 4', 1, today, today);
insert into chairs (id, location, unit_id, CREATE_DATE, UPDATED_DATE) values (5, 'Kab 3 right', 1, today, today);



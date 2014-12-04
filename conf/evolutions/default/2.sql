# --- !Ups


insert into units (id, name, start_work, end_work) values (1, 'Зубы и десны', '09:00:00', '20:00:00');

insert into users (id, surname, firstname, patronymic, birthday, fullname, CREATE_DATE, UPDATED_DATE) 
	values (1, 'Легостаев', 'Сергей', 'Васильевич', '1982-05-25', 'Легостаев Сергей Васильевич', today, today);
insert into users (id, surname, firstname, patronymic, birthday, fullname, CREATE_DATE, UPDATED_DATE) 
	values (2, 'Колесников', 'Владимир', 'Петрович', '1989-01-12', 'Колесников Владимир Петрович', today, today);

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

insert into work_periods (id, doctor_id, start_period, end_period) values (1, 1, '2014-01-01', '2014-05-01');

insert into work_days (id, period_id, day_index, start_work, end_work) values (1, 1, 1, '09:00:00', '19:00:00');
insert into work_days (id, period_id, day_index, start_work, end_work) values (2, 1, 2, '10:00:00', '20:00:00');
insert into work_days (id, period_id, day_index, is_weekend) 			values (3, 1, 3, true);
insert into work_days (id, period_id, day_index, start_work, end_work) values (4, 1, 4, '09:00:00', '15:00:00');
insert into work_days (id, period_id, day_index, start_work, end_work) values (5, 1, 5, '10:00:00', '21:00:00');
insert into work_days (id, period_id, day_index, start_work, end_work) values (6, 1, 6, '09:00:00', '18:00:00');
insert into work_days (id, period_id, day_index, is_weekend) 			values (7, 1, 0, true);

insert into time_list (id, work_day_id, start_time, end_time) values (1, 1, '09:00:00', '10:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (2, 1, '10:00:00', '11:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (3, 1, '11:00:00', '12:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (4, 1, '12:00:00', '13:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (5, 1, '13:00:00', '14:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (6, 1, '14:00:00', '15:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (7, 1, '15:00:00', '16:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (8, 1, '16:00:00', '17:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (9, 1, '17:00:00', '18:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (10, 1, '18:00:00', '19:00:00');

insert into time_list (id, work_day_id, start_time, end_time) values (11, 2, '10:00:00', '11:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (12, 2, '11:00:00', '12:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (13, 2, '12:00:00', '13:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (14, 2, '13:00:00', '14:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (15, 2, '14:00:00', '15:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (16, 2, '15:00:00', '16:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (17, 2, '16:00:00', '17:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (18, 2, '17:00:00', '18:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (19, 2, '18:00:00', '19:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (20, 2, '19:00:00', '20:00:00');

insert into time_list (id, work_day_id, start_time, end_time) values (21, 4, '09:00:00', '10:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (22, 4, '10:00:00', '11:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (23, 4, '11:00:00', '12:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (24, 4, '12:00:00', '13:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (25, 4, '13:00:00', '14:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (26, 4, '14:00:00', '15:00:00');

insert into time_list (id, work_day_id, start_time, end_time) values (27, 5, '10:00:00', '11:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (28, 5, '11:00:00', '12:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (29, 5, '12:00:00', '13:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (30, 5, '13:00:00', '14:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (31, 5, '14:00:00', '15:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (32, 5, '15:00:00', '16:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (33, 5, '16:00:00', '17:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (34, 5, '17:00:00', '18:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (35, 5, '18:00:00', '19:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (36, 5, '19:00:00', '20:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (37, 5, '20:00:00', '21:00:00');

insert into time_list (id, work_day_id, start_time, end_time) values (38, 6, '09:00:00', '10:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (39, 6, '10:00:00', '11:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (40, 6, '11:00:00', '12:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (41, 6, '12:00:00', '13:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (42, 6, '13:00:00', '14:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (43, 6, '14:00:00', '15:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (44, 6, '15:00:00', '16:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (45, 6, '16:00:00', '17:00:00');
insert into time_list (id, work_day_id, start_time, end_time) values (46, 6, '17:00:00', '18:00:00');

insert into groups (id, name, CREATE_DATE, UPDATED_DATE) values (1, 'Администраторы', today, today);
insert into groups (id, name, CREATE_DATE, UPDATED_DATE) values (2, 'Доктора', today, today);
insert into groups (id, name, CREATE_DATE, UPDATED_DATE) values (3, 'Регистраторы', today, today);
insert into groups (id, name, CREATE_DATE, UPDATED_DATE) values (4, 'Управляющие', today, today);

insert into group_members (group_id, user_id) values (1, 1);
insert into group_members (group_id, user_id) values (4, 2);

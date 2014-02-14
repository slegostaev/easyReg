# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table chairs (
  id                        bigint not null,
  location                  varchar(255),
  unit_id                   bigint,
  create_date               timestamp not null,
  updated_date              timestamp not null,
  constraint pk_chairs primary key (id))
;

create table doctors (
  id                        bigint not null,
  firstname                 varchar(255) not null,
  surname                   varchar(255) not null,
  patronymic                varchar(255) not null,
  is_active                 boolean default true not null,
  fullname                  varchar(255),
  email                     varchar(255),
  mobile                    varchar(255),
  home                      varchar(255),
  address                   varchar(255),
  city                      varchar(255),
  zip                       varchar(255),
  country                   varchar(255),
  birthday                  timestamp not null,
  unit_id                   bigint,
  create_date               timestamp not null,
  updated_date              timestamp not null,
  constraint uq_doctors_1 unique (firstname,surname,patronymic,birthday),
  constraint pk_doctors primary key (id))
;

create table patients (
  id                        bigint not null,
  firstname                 varchar(255) not null,
  surname                   varchar(255) not null,
  patronymic                varchar(255) not null,
  is_active                 boolean default true not null,
  fullname                  varchar(255),
  email                     varchar(255),
  mobile                    varchar(255),
  home                      varchar(255),
  address                   varchar(255),
  city                      varchar(255),
  zip                       varchar(255),
  country                   varchar(255),
  birthday                  timestamp not null,
  create_date               timestamp not null,
  updated_date              timestamp not null,
  constraint uq_patients_1 unique (firstname,surname,patronymic,birthday),
  constraint pk_patients primary key (id))
;

create table receptions (
  id                        bigint not null,
  patient_id                bigint,
  doctor_id                 bigint,
  reception_date            date,
  start_time                time not null,
  end_time                  time not null,
  description               varchar(255),
  first_time                boolean,
  create_date               timestamp not null,
  updated_date              timestamp not null,
  constraint pk_receptions primary key (id))
;

create table units (
  id                        bigint not null,
  name                      varchar(100) not null,
  start_work                time,
  end_work                  time,
  create_date               timestamp not null,
  updated_date              timestamp not null,
  constraint uq_units_name unique (name),
  constraint pk_units primary key (id))
;

create table work_places (
  doctor_id                 bigint,
  chair_id                  bigint,
  start_date                timestamp,
  end_date                  timestamp)
;

create sequence chairs_seq;

create sequence doctors_seq;

create sequence patients_seq;

create sequence receptions_seq;

create sequence units_seq;

alter table chairs add constraint fk_chairs_unit_1 foreign key (unit_id) references units (id) on delete restrict on update restrict;
create index ix_chairs_unit_1 on chairs (unit_id);
alter table doctors add constraint fk_doctors_unit_2 foreign key (unit_id) references units (id) on delete restrict on update restrict;
create index ix_doctors_unit_2 on doctors (unit_id);
alter table receptions add constraint fk_receptions_patient_3 foreign key (patient_id) references patients (id) on delete restrict on update restrict;
create index ix_receptions_patient_3 on receptions (patient_id);
alter table receptions add constraint fk_receptions_doctor_4 foreign key (doctor_id) references doctors (id) on delete restrict on update restrict;
create index ix_receptions_doctor_4 on receptions (doctor_id);
alter table work_places add constraint fk_work_places_doctor_5 foreign key (doctor_id) references doctors (id) on delete restrict on update restrict;
create index ix_work_places_doctor_5 on work_places (doctor_id);
alter table work_places add constraint fk_work_places_chair_6 foreign key (chair_id) references chairs (id) on delete restrict on update restrict;
create index ix_work_places_chair_6 on work_places (chair_id);



# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists chairs;

drop table if exists doctors;

drop table if exists patients;

drop table if exists receptions;

drop table if exists units;

drop table if exists work_places;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists chairs_seq;

drop sequence if exists doctors_seq;

drop sequence if exists patients_seq;

drop sequence if exists receptions_seq;

drop sequence if exists units_seq;


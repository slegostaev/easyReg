# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table clinics (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  name                      varchar(100) not null,
  start_work                time,
  end_work                  time,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint uq_clinics_name unique (name),
  constraint pk_clinics primary key (id))
;

create table groups (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  name                      varchar(100) not null,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint uq_groups_name unique (name),
  constraint pk_groups primary key (id))
;

create table patients (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  firstname                 varchar(255) not null,
  surname                   varchar(255) not null,
  patronymic                varchar(255) not null,
  fullname                  varchar(255),
  email                     varchar(255),
  mobile                    varchar(255),
  home                      varchar(255),
  address                   varchar(255),
  city                      varchar(255),
  zip                       varchar(255),
  country                   varchar(255),
  birthday                  timestamp not null,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint uq_patients_1 unique (firstname,surname,patronymic,birthday),
  constraint pk_patients primary key (id))
;

create table protected_pages (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  class_name                varchar(100) not null,
  method_name               varchar(100) not null,
  description               varchar(250),
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint uq_protected_pages_1 unique (class_name,method_name),
  constraint pk_protected_pages primary key (id))
;

create table receptions (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  patient_id                bigint,
  doctor_id                 bigint,
  reception_date            date,
  start_time                time not null,
  end_time                  time not null,
  description               varchar(255),
  first_time                boolean,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint pk_receptions primary key (id))
;

create table schedule_templates (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  doctor_id                 bigint,
  start_period              timestamp not null,
  end_period                timestamp,
  period_type               integer default 0 not null,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint ck_schedule_templates_period_type check (period_type in (0,1)),
  constraint pk_schedule_templates primary key (id))
;

create table sessions (
  session_id                varchar(255) not null,
  user_id                   bigint,
  constraint pk_sessions primary key (session_id))
;

create table time_list (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  work_day_id               bigint,
  start_time                time not null,
  end_time                  time not null,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint pk_time_list primary key (id))
;

create table users (
  user_type                 integer(31) not null,
  id                        bigint auto_increment not null,
  creator_id                bigint,
  firstname                 varchar(255) not null,
  surname                   varchar(255) not null,
  patronymic                varchar(255) not null,
  fullname                  varchar(255),
  email                     varchar(255),
  mobile                    varchar(255),
  home                      varchar(255),
  address                   varchar(255),
  city                      varchar(255),
  zip                       varchar(255),
  country                   varchar(255),
  birthday                  timestamp not null,
  is_active                 boolean default true not null,
  login                     varchar(255),
  password                  varchar(255),
  clinic_id                 bigint,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint uq_users_1 unique (firstname,surname,patronymic,birthday),
  constraint pk_users primary key (id))
;

create table work_days (
  id                        bigint auto_increment not null,
  creator_id                bigint,
  start_work                time,
  end_work                  time,
  is_weekend                boolean default false not null,
  duration_visit            integer default 60 not null,
  day_index                 integer,
  schedule_template_id      bigint,
  create_date               TIMESTAMP default CURRENT_TIMESTAMP not null,
  updated_date              TIMESTAMP default CURRENT_TIMESTAMP not null,
  constraint ck_work_days_day_index check (day_index in (0,1,2,3,4,5,6)),
  constraint pk_work_days primary key (id))
;


create table access_list (
  group_id                       bigint not null,
  page_id                        bigint not null,
  constraint pk_access_list primary key (group_id, page_id))
;

create table group_members (
  group_id                       bigint not null,
  user_id                        bigint not null,
  constraint pk_group_members primary key (group_id, user_id))
;
create sequence sessions_seq;

alter table clinics add constraint fk_clinics_creator_1 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_clinics_creator_1 on clinics (creator_id);
alter table groups add constraint fk_groups_creator_2 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_groups_creator_2 on groups (creator_id);
alter table patients add constraint fk_patients_creator_3 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_patients_creator_3 on patients (creator_id);
alter table protected_pages add constraint fk_protected_pages_creator_4 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_protected_pages_creator_4 on protected_pages (creator_id);
alter table receptions add constraint fk_receptions_creator_5 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_receptions_creator_5 on receptions (creator_id);
alter table receptions add constraint fk_receptions_patient_6 foreign key (patient_id) references patients (id) on delete restrict on update restrict;
create index ix_receptions_patient_6 on receptions (patient_id);
alter table receptions add constraint fk_receptions_doctor_7 foreign key (doctor_id) references users (id) on delete restrict on update restrict;
create index ix_receptions_doctor_7 on receptions (doctor_id);
alter table schedule_templates add constraint fk_schedule_templates_creator_8 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_schedule_templates_creator_8 on schedule_templates (creator_id);
alter table schedule_templates add constraint fk_schedule_templates_doctor_9 foreign key (doctor_id) references users (id) on delete restrict on update restrict;
create index ix_schedule_templates_doctor_9 on schedule_templates (doctor_id);
alter table sessions add constraint fk_sessions_user_10 foreign key (user_id) references users (id) on delete restrict on update restrict;
create index ix_sessions_user_10 on sessions (user_id);
alter table time_list add constraint fk_time_list_creator_11 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_time_list_creator_11 on time_list (creator_id);
alter table time_list add constraint fk_time_list_workDay_12 foreign key (work_day_id) references work_days (id) on delete restrict on update restrict;
create index ix_time_list_workDay_12 on time_list (work_day_id);
alter table users add constraint fk_users_creator_13 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_users_creator_13 on users (creator_id);
alter table users add constraint fk_users_clinic_14 foreign key (clinic_id) references clinics (id) on delete restrict on update restrict;
create index ix_users_clinic_14 on users (clinic_id);
alter table work_days add constraint fk_work_days_creator_15 foreign key (creator_id) references users (id) on delete restrict on update restrict;
create index ix_work_days_creator_15 on work_days (creator_id);
alter table work_days add constraint fk_work_days_scheduleTemplate_16 foreign key (schedule_template_id) references schedule_templates (id) on delete restrict on update restrict;
create index ix_work_days_scheduleTemplate_16 on work_days (schedule_template_id);



alter table access_list add constraint fk_access_list_protected_page_01 foreign key (group_id) references protected_pages (id) on delete restrict on update restrict;

alter table access_list add constraint fk_access_list_groups_02 foreign key (page_id) references groups (id) on delete restrict on update restrict;

alter table group_members add constraint fk_group_members_users_01 foreign key (group_id) references users (id) on delete restrict on update restrict;

alter table group_members add constraint fk_group_members_groups_02 foreign key (user_id) references groups (id) on delete restrict on update restrict;

# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists clinics;

drop table if exists groups;

drop table if exists group_members;

drop table if exists access_list;

drop table if exists patients;

drop table if exists protected_pages;

drop table if exists receptions;

drop table if exists schedule_templates;

drop table if exists sessions;

drop table if exists time_list;

drop table if exists users;

drop table if exists work_days;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists sessions_seq;


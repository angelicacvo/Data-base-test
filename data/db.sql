create database prueba_2_angelica_cuervo_vanrossum

create table users(
	user_id int auto_increment primary key,
	full_name varchar(120) not null, 
	id_document varchar(45) not null,
	address varchar(80) not null,
	city varchar(90) not null,
	phone_number varchar(90) not null,
	email varchar(120) not null unique
)

create table books(
	book_id int auto_increment primary key,
	isbn varchar(90) not null unique,
	title varchar(120) not null,
	author varchar(90) not null,
	publication_year year not null 
)

create  table returns(
	return_id int auto_increment primary key,
	return_date date,
	generated_penalty int not null,
	paid_penalty int not null
)

create table platforms(
	platform_id int auto_increment primary key,
	platform varchar(90) not null	
)

create table loans(
	loan_id varchar(45) primary key,
	hour time not null,
	date date not null,
	days int not null,
	status varchar(30),
	type enum('prestamo a domicilio', 'consulta en sala', 'prestamo interbibliotecario'),
	user_id int not null,
	platform_id int not null,
	book_id int not null,
	return_id int not null,
	foreign key (user_id) references users(user_id),
	foreign key (platform_id) references platforms(platform_id),
	foreign key (book_id) references books(book_id),
	foreign key (return_id) references returns(return_id)
)
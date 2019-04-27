use sakila;
select * from actor;
-- 1a
select first_name, last_name from actor;

-- 1b
select
	concat(first_name, ' ', last_name) as 'Actor Name'
    from actor;

-- 2a
select actor_id, first_name, last_name from actor where first_name = "JOE";

-- 2b
Select * from actor where last_name like '%GEN%';

-- 2c
select * from actor where last_name like '%LI%' ORDER BY LAST_NAME,FIRST_NAME;

-- 2d
select country_id,country from country where country in('Afghanistan','Bangladesh','China');

-- 3a
alter table actor add column description blob;

-- 3b
alter table actor drop column description;

-- 4a
select last_name as 'Last Name', count(last_name) as 'Count' from actor group by last_name;

-- 4b
select last_name as 'Last Name', count(last_name) as Count from actor group by last_name having Count >= 2;

-- 4c
UPDATE actor set first_name = "HARPO" where actor_id = 172; -- or where first_name = groucho and last_name = williams, i just did a select * from actor where first_name = groucho to find out what actor id he was

-- 4d
update actor set first_name = "GROUCHO" where first_name = "HARPO";

-- 5a
SHOW CREATE TABLE address;

-- 6a
select first_name, last_name, address from staff join address USING (address_id);

-- 6b
select first_name, last_name, sum(amount) as total_amount_paid from staff join payment using (staff_id) group by staff_id;

-- 6c
select title, COUNT(title) as 'actor count' from film_actor join film USING(film_id) group by film_id;

-- 6d
select count(film_id) as count from inventory where film_id = (select film_id from film where title = "Hunchback Impossible");

-- 6e
select first_name, last_name, SUM(amount) as 'Total Amount Paid' from payment join customer using(customer_id) group by customer_id order by last_name;

-- 7a
select * from film where (title like "K%" or title like "Q%") and language_id = (select language_id from language where name = "English");

-- 7b
select first_name, last_name from actor where actor_id in (select actor_id from film_actor where film_id = (select film_id from film where title = 'Alone Trip'));

-- 7c
select first_name, last_name, email
	from customer
    join address using (address_id)
    join city using (city_id)
    join country using (country_id)
    where country = "Canada";
    
-- 7d
select * from film where film_id in (select film_id from film_category where category_id = (select category_id from category where name = "Family"));

-- 7e
select title, COUNT(film_id) as "# of rentals" from rental
	join inventory using(inventory_id)
    join film using (film_id)
    group by film_id order by count(film_id) desc;
    
-- 7f
select staff_id,sum(amount) as "total sales($)" from payment group by staff_id;

-- 7g
select store_id,city,country from store, city, address, country where (store.address_id = address.address_id and city.city_id = address.city_id and city.country_id = country.country_id);

-- 7h
select sum(amount) as Total, category.name from rental, payment,inventory,film_category,category 
	where (rental.rental_id = payment.rental_id
    and rental.inventory_id = inventory.inventory_id
    and inventory.film_id = film_category.film_id
    and film_category.category_id = category.category_id)
    group by category.name
    order by Total desc
    limit 5;

-- 8a
create view top_five_genres as
	select sum(amount) as 'Total', category.name as 'Name' from rental, payment,inventory,film_category,category 
	where (rental.rental_id = payment.rental_id
    and rental.inventory_id = inventory.inventory_id
    and inventory.film_id = film_category.film_id
    and film_category.category_id = category.category_id)
    group by category.name
    order by Total desc
    limit 5;
    
-- 8b
select * from top_five_genres;

-- 8c
drop view if exists top_five_genres;
Create Database FoodDelivery;

drop Table if exists Delivery;
CREATE TABLE delivery (
    order_id INT,
    distance FLOAT,
    weather VARCHAR(50),
    traffic_level VARCHAR(50),
    time_of_day VARCHAR(50),
    vehicle_type VARCHAR(50),
    preparation_time_min FLOAT,
    courier_experience_yrs FLOAT,
    delivery_time_min FLOAT
);

Copy Delivery(Order_Id, Distance, Weather, Traffic_Level, Time_of_Day, Vehicle_type, Preparation_Time_Min, Courier_Experience_yrs, Delivery_Time_min)
from 'C:\Users\Public\Food Delivery Project\Food_Delivery_Times.csv'
Delimiter ','
CSV Header

drop table if exists orders;
create Table ORDERS(
	Order_ID int Primary KEy,
	Distance float,
	Preparation_Time_min int,
	Delivery_Time_min int,
	Time_of_Day Varchar(100)
);

drop table if exists delivery_details;
cREATE TABLE Delivery_details(
	Order_ID int,
	Weather Varchar(100),
	Vehicle_type Varchar(100),
	Traffic_Level Varchar(100),
	Courier_Experience_yrs float
);

Select * from Delivery
Select * from Orders
Selet * from Delivery_details


Insert into Orders (
	Order_ID,
	distance,
	preparation_time_min,
	delivery_time_min,
	time_of_day
)
Select 
	order_ID,
	distance,
	preparation_time_min,
	delivery_time_min,
	time_of_day
from Delivery;

Insert into delivery_details (
	Order_ID,
	Weather,
	traffic_level,
	vehicle_type,
	courier_experience_yrs
)
Select 
	Order_ID,
	weather,
	traffic_level,
	vehicle_type,
	courier_experience_yrs
from Delivery;

Select count(*) from delivery_details
where weather is null

--as there wew 30 null values we updated the dataset
Update Delivery_details 
set weather = 'Unknown'
where weather is null;

--Q1.Average Delivery time by weather

Select d.weather, Avg(o.delivery_time_min) as Avg_delivery 
from orders o
join delivery_details d
on o.order_id = d.order_id
group by d.weather

--Q2. Which vehicle performs best i.e time_efficient vehicle type?
Select d.vehicle_type, round(Avg(o.delivery_time_min),2) as Avg_dlvry_time
from delivery_details d
join orders o 
on d.order_id = o.order_id
group by d.vehicle_type


--Q3. Traffic Impact on Delivery
select d.Traffic_level, Avg(o.delivery_time_min) as Avg_dlvry_time
from delivery_details d
join orders o 
on o.order_id = d.order_id
group by d.traffic_level

--Traffic columnn has null values so updating 
select count(*) from delivery_details
where traffic_level is null 
-- 30 null values found
update delivery_details
set traffic_level = 'Unknown'
where traffic_level is null
--now run the 3rd query

--Q4. What is the average courier_experience years?
Select Avg(courier_experience_yrs) from delivery_details

--Q5. Rank Total deliveries by delivery time.
Select 
	o.order_id,
	o.delivery_time_min,
	o.distance,
	d.weather,
	d.vehicle_type,
	d.traffic_level,
	
	Round((o.delivery_time_min / o.distance)::numeric, 2) as min_per_km,
	
	Rank() over (
		order by (o.delivery_time_min/o.distance) desc
	) as delivery_efficiency_rank 
from orders o 
join delivery_details d 
	on o.order_id = d.order_id;

--Q6. Compare current delivery with previous
SELECT order_id,
       delivery_time_min,
       LAG(delivery_time_min)
       OVER (
           ORDER BY order_id
       ) AS previous_delivery
FROM orders;

--Q7. Predict next expected delivery trend(time)
Select order_id,
delivery_time_min,
lead(delivery_time_min)
over(
	order by order_id
)as next_delivery
from orders

--Q8. Find the worst combination for delivery?
Select 
	d.weather,
	d.traffic_level,
	d.vehicle_type,
	round(avg(o.delivery_time_min),2) as Avg_dlvry_time
from orders o
join delivery_details d
on o.order_id = d.order_id

group by 
	d.weather,
	d.traffic_level,
	d.vehicle_type
order by Avg_dlvry_time

--Q9. Find the order taking more than avg deilvery time
with avg_delivery as
(select avg(delivery_time_min) as avg_time from orders)

select * from orders 
where delivery_time_min > (select avg_time from avg_delivery)

--Q10. Does experience reduce delay?
Select
	Case
		when courier_experience_yrs >= 3
		then 'EXPERIENCED'
		ELSE 'Less Experienced'
	end as experience_group,

	avg(o.delivery_time_min)

from orders o
join delivery_details d
on o.order_id = d.order_id

group by experience_group
	
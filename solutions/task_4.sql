select
  h2.yr as year,
  sum(is_white_christmas) as white_christmas_count
from (
  select
    yr,
    (case when min(m12) < 0 then 1 else 0 end) as is_white_christmas
  from hadcet
  where dy between 21 and 25
  group by yr
) as h1
join (
  select distinct yr
  from hadcet
  where yr between 1805 and 1813
) as h2
on h1.yr between h2.yr + 2 and h2.yr + 11
group by h2.yr
order by year
;

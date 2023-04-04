select year, sum(status)
  from (
  select
    h2.yr as year,
    (case when min(h1.m12) < 0 then 1 else 0 end) as status
  from hadcet as h1
  join hadcet as h2
  on h1.yr between h2.yr + 2 and h2.yr + 11
  where h1.dy between 21 and 25
  group by h2.yr, h1.yr
) as t_inner
where year between 1809 and 1813
group by year
order by year
;

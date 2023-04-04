select year, sum(status)
  from (
  select
    h2.yr as year,
    h1.yr,
    min(h1.m12),
    (case when min(h1.m12) < 0 then 1 else 0 end) as status
  from hadcet as h1
  join hadcet as h2
  on h1.yr between h2.yr and h2.yr + 11 /*and h1.dy = h2.dy*/
  where h1.dy between 21 and 25
    and h2.dy between 21 and 25
  group by h2.yr, h1.yr
  order by h2.yr asc, h1.yr asc
) as t_inner
where year between 1809 and 1813
group by year
;

-- select yr, dy, m12
-- from hadcet
-- WHERE dy BETWEEN 21 AND 25

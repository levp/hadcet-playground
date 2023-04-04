select
  h1.yr as yob, -- Year of birth.
  count(*) as wwc -- White Christmas count.
from (
  -- Make list of years in range.
  select yr
  from hadcet
  where yr between 1805 and 1813
  group by yr
) as h1
join (
  -- Make list of years with white Christmases.
  select yr
  from hadcet
  where dy between 21 and 25
  group by yr
  -- Only years with at least one day between the 21st and 25th of december
  -- having less than zero degrees Celsius is considered a white Christmas.
  having min(m12) < 0
) as h2
-- Join the two lists by the logic in the task: ages 3 to 12 inclusive.
-- Year of birth (h2.year) is considered age 1.
-- NOTE: `between-and` is inclusive on both ends.
on h2.yr between h1.yr + 2 and h1.yr + 11
group by h1.yr
order by yob
;

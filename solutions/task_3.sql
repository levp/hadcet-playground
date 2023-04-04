SELECT
  (yr - 1811) as age,
  (case when min(m12) < 0 then 'White Christmas' else 'No Snow' end) as status
FROM hadcet
WHERE yr BETWEEN 1812 AND 1812+11
  AND dy BETWEEN 21 AND 25
GROUP BY yr
;

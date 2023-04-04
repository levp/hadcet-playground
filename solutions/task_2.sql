SELECT
  (yr - 1811) as age,
(m12 / 10.0) as temperature
FROM hadcet
WHERE yr BETWEEN 1812 AND 1812+11
  AND dy = 25
;

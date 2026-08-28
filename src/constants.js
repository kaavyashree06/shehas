export const calculateMedicalUnits = (volumeMl, abv = 0.40) => {
  const gramsOfAlcohol = volumeMl * abv * 0.8;
  return Math.round((gramsOfAlcohol / 10) * 10) / 10;
};

export const BOTTLE_SIZES = [
  { label: '30 ml Peg Shot', ml: 30, units: calculateMedicalUnits(30) },
  { label: '60 ml Large Peg', ml: 60, units: calculateMedicalUnits(60) },
  { label: '180 ml Quarter', ml: 180, units: calculateMedicalUnits(180) },
  { label: '375 ml Half', ml: 375, units: calculateMedicalUnits(375) },
];

export const AIIMS_RULES = {
  Male: { maxDailyUnits: 2.0, maxMonthlyUnits: 56.0 },
  Female: { maxDailyUnits: 1.0, maxMonthlyUnits: 28.0 }
};
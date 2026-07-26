export interface HscCourse {
  id: string;
  name: string;
  category: 'English' | 'Mathematics' | 'Science' | 'HSIE' | 'Tech' | 'Creative' | 'Languages' | 'VET';
  units: number; // 1 or 2
  isCategoryB?: boolean;
  // Raw 0-100 to Scaled 0-50 per unit curve (scaled score per unit for raw mark 50, 60, 70, 80, 90, 100)
  scalingPoints: { raw: number; scaledPerUnit: number }[];
}

export interface SelectedCourse {
  courseId: string;
  rawMark: number; // 0 to 100
}

// 35+ Popular NSW HSC Courses with UAC Scaled Mark Distributions (per unit out of 50)
export const HSC_COURSES: HscCourse[] = [
  // ENGLISH
  {
    id: 'eng_adv',
    name: 'English Advanced',
    category: 'English',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 20 },
      { raw: 60, scaledPerUnit: 26 },
      { raw: 70, scaledPerUnit: 32 },
      { raw: 80, scaledPerUnit: 38 },
      { raw: 90, scaledPerUnit: 44 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'eng_std',
    name: 'English Standard',
    category: 'English',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 12 },
      { raw: 60, scaledPerUnit: 18 },
      { raw: 70, scaledPerUnit: 24 },
      { raw: 80, scaledPerUnit: 31 },
      { raw: 90, scaledPerUnit: 39 },
      { raw: 100, scaledPerUnit: 47 },
    ],
  },
  {
    id: 'eng_eald',
    name: 'English EAL/D',
    category: 'English',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 14 },
      { raw: 60, scaledPerUnit: 20 },
      { raw: 70, scaledPerUnit: 26 },
      { raw: 80, scaledPerUnit: 33 },
      { raw: 90, scaledPerUnit: 41 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },
  {
    id: 'eng_ext1',
    name: 'English Extension 1',
    category: 'English',
    units: 1,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 24 },
      { raw: 60, scaledPerUnit: 30 },
      { raw: 70, scaledPerUnit: 36 },
      { raw: 80, scaledPerUnit: 42 },
      { raw: 90, scaledPerUnit: 46 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'eng_ext2',
    name: 'English Extension 2',
    category: 'English',
    units: 1,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 25 },
      { raw: 60, scaledPerUnit: 31 },
      { raw: 70, scaledPerUnit: 37 },
      { raw: 80, scaledPerUnit: 43 },
      { raw: 90, scaledPerUnit: 47 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },

  // MATHEMATICS
  {
    id: 'math_adv',
    name: 'Mathematics Advanced',
    category: 'Mathematics',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 18 },
      { raw: 60, scaledPerUnit: 25 },
      { raw: 70, scaledPerUnit: 32 },
      { raw: 80, scaledPerUnit: 39 },
      { raw: 90, scaledPerUnit: 45 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'math_std2',
    name: 'Mathematics Standard 2',
    category: 'Mathematics',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 11 },
      { raw: 60, scaledPerUnit: 17 },
      { raw: 70, scaledPerUnit: 24 },
      { raw: 80, scaledPerUnit: 31 },
      { raw: 90, scaledPerUnit: 39 },
      { raw: 100, scaledPerUnit: 47 },
    ],
  },
  {
    id: 'math_std1',
    name: 'Mathematics Standard 1',
    category: 'Mathematics',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 9 },
      { raw: 60, scaledPerUnit: 14 },
      { raw: 70, scaledPerUnit: 20 },
      { raw: 80, scaledPerUnit: 27 },
      { raw: 90, scaledPerUnit: 35 },
      { raw: 100, scaledPerUnit: 44 },
    ],
  },
  {
    id: 'math_ext1',
    name: 'Mathematics Extension 1',
    category: 'Mathematics',
    units: 1, // 1u in Y12, 2u if with Ext 2
    scalingPoints: [
      { raw: 50, scaledPerUnit: 27 },
      { raw: 60, scaledPerUnit: 33 },
      { raw: 70, scaledPerUnit: 39 },
      { raw: 80, scaledPerUnit: 44 },
      { raw: 90, scaledPerUnit: 48 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'math_ext2',
    name: 'Mathematics Extension 2',
    category: 'Mathematics',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 32 },
      { raw: 60, scaledPerUnit: 38 },
      { raw: 70, scaledPerUnit: 43 },
      { raw: 80, scaledPerUnit: 46.5 },
      { raw: 90, scaledPerUnit: 48.8 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },

  // SCIENCES
  {
    id: 'physics',
    name: 'Physics',
    category: 'Science',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 21 },
      { raw: 60, scaledPerUnit: 28 },
      { raw: 70, scaledPerUnit: 34 },
      { raw: 80, scaledPerUnit: 41 },
      { raw: 90, scaledPerUnit: 46 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'Science',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 22 },
      { raw: 60, scaledPerUnit: 29 },
      { raw: 70, scaledPerUnit: 36 },
      { raw: 80, scaledPerUnit: 42 },
      { raw: 90, scaledPerUnit: 47 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'Science',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 16 },
      { raw: 60, scaledPerUnit: 22 },
      { raw: 70, scaledPerUnit: 29 },
      { raw: 80, scaledPerUnit: 36 },
      { raw: 90, scaledPerUnit: 43 },
      { raw: 100, scaledPerUnit: 49 },
    ],
  },
  {
    id: 'ees',
    name: 'Earth & Environmental Science',
    category: 'Science',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 15 },
      { raw: 60, scaledPerUnit: 21 },
      { raw: 70, scaledPerUnit: 27 },
      { raw: 80, scaledPerUnit: 34 },
      { raw: 90, scaledPerUnit: 42 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },
  {
    id: 'investigating_sci',
    name: 'Investigating Science',
    category: 'Science',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 13 },
      { raw: 60, scaledPerUnit: 19 },
      { raw: 70, scaledPerUnit: 25 },
      { raw: 80, scaledPerUnit: 32 },
      { raw: 90, scaledPerUnit: 40 },
      { raw: 100, scaledPerUnit: 47 },
    ],
  },
  {
    id: 'science_ext',
    name: 'Science Extension',
    category: 'Science',
    units: 1,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 26 },
      { raw: 60, scaledPerUnit: 32 },
      { raw: 70, scaledPerUnit: 38 },
      { raw: 80, scaledPerUnit: 44 },
      { raw: 90, scaledPerUnit: 47.5 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },

  // HSIE
  {
    id: 'economics',
    name: 'Economics',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 21 },
      { raw: 60, scaledPerUnit: 28 },
      { raw: 70, scaledPerUnit: 35 },
      { raw: 80, scaledPerUnit: 41 },
      { raw: 90, scaledPerUnit: 46 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'business_studies',
    name: 'Business Studies',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 13 },
      { raw: 60, scaledPerUnit: 19 },
      { raw: 70, scaledPerUnit: 26 },
      { raw: 80, scaledPerUnit: 33 },
      { raw: 90, scaledPerUnit: 41 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },
  {
    id: 'legal_studies',
    name: 'Legal Studies',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 15 },
      { raw: 60, scaledPerUnit: 22 },
      { raw: 70, scaledPerUnit: 29 },
      { raw: 80, scaledPerUnit: 36 },
      { raw: 90, scaledPerUnit: 43 },
      { raw: 100, scaledPerUnit: 49 },
    ],
  },
  {
    id: 'modern_history',
    name: 'Modern History',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 17 },
      { raw: 60, scaledPerUnit: 24 },
      { raw: 70, scaledPerUnit: 31 },
      { raw: 80, scaledPerUnit: 38 },
      { raw: 90, scaledPerUnit: 44 },
      { raw: 100, scaledPerUnit: 49.5 },
    ],
  },
  {
    id: 'ancient_history',
    name: 'Ancient History',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 16 },
      { raw: 60, scaledPerUnit: 23 },
      { raw: 70, scaledPerUnit: 30 },
      { raw: 80, scaledPerUnit: 37 },
      { raw: 90, scaledPerUnit: 44 },
      { raw: 100, scaledPerUnit: 49 },
    ],
  },
  {
    id: 'history_ext',
    name: 'History Extension',
    category: 'HSIE',
    units: 1,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 23 },
      { raw: 60, scaledPerUnit: 29 },
      { raw: 70, scaledPerUnit: 36 },
      { raw: 80, scaledPerUnit: 42 },
      { raw: 90, scaledPerUnit: 46.5 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    category: 'HSIE',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 14 },
      { raw: 60, scaledPerUnit: 20 },
      { raw: 70, scaledPerUnit: 27 },
      { raw: 80, scaledPerUnit: 34 },
      { raw: 90, scaledPerUnit: 42 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },

  // TECH & CREATIVE
  {
    id: 'sdd',
    name: 'Software Engineering / SDD',
    category: 'Tech',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 17 },
      { raw: 60, scaledPerUnit: 24 },
      { raw: 70, scaledPerUnit: 31 },
      { raw: 80, scaledPerUnit: 38 },
      { raw: 90, scaledPerUnit: 44 },
      { raw: 100, scaledPerUnit: 49 },
    ],
  },
  {
    id: 'engineering_studies',
    name: 'Engineering Studies',
    category: 'Tech',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 19 },
      { raw: 60, scaledPerUnit: 26 },
      { raw: 70, scaledPerUnit: 33 },
      { raw: 80, scaledPerUnit: 40 },
      { raw: 90, scaledPerUnit: 45.5 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'ipt',
    name: 'Enterprise Computing / IPT',
    category: 'Tech',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 12 },
      { raw: 60, scaledPerUnit: 18 },
      { raw: 70, scaledPerUnit: 24 },
      { raw: 80, scaledPerUnit: 31 },
      { raw: 90, scaledPerUnit: 39 },
      { raw: 100, scaledPerUnit: 47 },
    ],
  },
  {
    id: 'visual_arts',
    name: 'Visual Arts',
    category: 'Creative',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 13 },
      { raw: 60, scaledPerUnit: 19 },
      { raw: 70, scaledPerUnit: 26 },
      { raw: 80, scaledPerUnit: 33 },
      { raw: 90, scaledPerUnit: 41 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },
  {
    id: 'music_2',
    name: 'Music 2',
    category: 'Creative',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 22 },
      { raw: 60, scaledPerUnit: 29 },
      { raw: 70, scaledPerUnit: 36 },
      { raw: 80, scaledPerUnit: 42 },
      { raw: 90, scaledPerUnit: 47 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'music_1',
    name: 'Music 1',
    category: 'Creative',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 11 },
      { raw: 60, scaledPerUnit: 17 },
      { raw: 70, scaledPerUnit: 23 },
      { raw: 80, scaledPerUnit: 30 },
      { raw: 90, scaledPerUnit: 38 },
      { raw: 100, scaledPerUnit: 46 },
    ],
  },
  {
    id: 'pdhpe',
    name: 'PDHPE',
    category: 'Creative',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 12 },
      { raw: 60, scaledPerUnit: 18 },
      { raw: 70, scaledPerUnit: 25 },
      { raw: 80, scaledPerUnit: 32 },
      { raw: 90, scaledPerUnit: 40 },
      { raw: 100, scaledPerUnit: 48 },
    ],
  },

  // LANGUAGES
  {
    id: 'french_cont',
    name: 'French Continuers',
    category: 'Languages',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 20 },
      { raw: 60, scaledPerUnit: 27 },
      { raw: 70, scaledPerUnit: 34 },
      { raw: 80, scaledPerUnit: 41 },
      { raw: 90, scaledPerUnit: 46 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },
  {
    id: 'japanese_cont',
    name: 'Japanese Continuers',
    category: 'Languages',
    units: 2,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 21 },
      { raw: 60, scaledPerUnit: 28 },
      { raw: 70, scaledPerUnit: 35 },
      { raw: 80, scaledPerUnit: 41.5 },
      { raw: 90, scaledPerUnit: 46.5 },
      { raw: 100, scaledPerUnit: 50 },
    ],
  },

  // VET CATEGORY B
  {
    id: 'vet_hospitality',
    name: 'VET Hospitality (Cat B)',
    category: 'VET',
    units: 2,
    isCategoryB: true,
    scalingPoints: [
      { raw: 50, scaledPerUnit: 10 },
      { raw: 60, scaledPerUnit: 15 },
      { raw: 70, scaledPerUnit: 21 },
      { raw: 80, scaledPerUnit: 28 },
      { raw: 90, scaledPerUnit: 36 },
      { raw: 100, scaledPerUnit: 44 },
    ],
  },
];

// Helper: Linear Interpolation for Raw -> Scaled Mark (0-50 per unit)
export function getScaledMarkPerUnit(course: HscCourse, rawMark: number): number {
  const points = course.scalingPoints;
  if (rawMark <= points[0].raw) return points[0].scaledPerUnit;
  if (rawMark >= points[points.length - 1].raw) return points[points.length - 1].scaledPerUnit;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (rawMark >= p1.raw && rawMark <= p2.raw) {
      const ratio = (rawMark - p1.raw) / (p2.raw - p1.raw);
      return p1.scaledPerUnit + ratio * (p2.scaledPerUnit - p1.scaledPerUnit);
    }
  }
  return 0;
}

// Convert Aggregate (0 to 500) to ATAR (0.00 to 99.95) based on UAC Aggregate Table
export function aggregateToAtar(aggregate: number): number {
  if (aggregate < 150) return Math.max(0, (aggregate / 150) * 30);
  if (aggregate <= 250) return 30 + ((aggregate - 150) / 100) * 30; // 30 - 60
  if (aggregate <= 330) return 60 + ((aggregate - 250) / 80) * 15; // 60 - 75
  if (aggregate <= 380) return 75 + ((aggregate - 330) / 50) * 10; // 75 - 85
  if (aggregate <= 420) return 85 + ((aggregate - 380) / 40) * 7.5; // 85 - 92.5
  if (aggregate <= 450) return 92.5 + ((aggregate - 420) / 30) * 4.5; // 92.5 - 97.0
  if (aggregate <= 475) return 97.0 + ((aggregate - 450) / 25) * 2.2; // 97.0 - 99.2
  if (aggregate <= 495) return 99.2 + ((aggregate - 475) / 20) * 0.7; // 99.2 - 99.9
  return Math.min(99.95, 99.9 + ((aggregate - 495) / 5) * 0.05); // 99.90 - 99.95
}

export interface RuleValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

// NESA / UAC Rules Validator
export function validateHscRules(selectedCourses: SelectedCourse[]): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const courseMap = new Map<string, HscCourse>();
  selectedCourses.forEach((sc) => {
    const c = HSC_COURSES.find((item) => item.id === sc.courseId);
    if (c) courseMap.set(c.id, c);
  });

  // Calculate total units
  let totalUnits = 0;
  let englishUnits = 0;
  let scienceUnits = 0;
  let catBUnits = 0;

  courseMap.forEach((c) => {
    // Handling Ext 2 maths unit override rule
    let units = c.units;
    if (c.id === 'math_ext2') {
      units = 2;
    }
    totalUnits += units;

    if (c.category === 'English') englishUnits += c.units;
    if (c.category === 'Science') scienceUnits += c.units;
    if (c.isCategoryB) catBUnits += c.units;
  });

  // 1. Total units check
  if (totalUnits < 10) {
    errors.push(`Minimum 10 ATAR units required. Currently selected: ${totalUnits} units.`);
  }

  // 2. English requirement
  if (englishUnits < 2) {
    errors.push('At least 2 units of English are mandatory for an ATAR.');
  }

  // 3. Mathematics Rules
  const hasMathAdv = courseMap.has('math_adv');
  const hasMathStd1 = courseMap.has('math_std1');
  const hasMathStd2 = courseMap.has('math_std2');
  const hasMathExt1 = courseMap.has('math_ext1');
  const hasMathExt2 = courseMap.has('math_ext2');

  if ((hasMathStd1 || hasMathStd2) && hasMathAdv) {
    errors.push('Cannot take Mathematics Standard and Mathematics Advanced simultaneously.');
  }
  if (hasMathExt1 && !hasMathAdv && !hasMathExt2) {
    warnings.push('Mathematics Extension 1 normally requires Mathematics Advanced.');
  }
  if (hasMathExt2 && !hasMathExt1) {
    errors.push('Mathematics Extension 2 requires Mathematics Extension 1.');
  }

  // 4. English Extension Rules
  const hasEngAdv = courseMap.has('eng_adv');
  const hasEngExt1 = courseMap.has('eng_ext1');
  const hasEngExt2 = courseMap.has('eng_ext2');

  if (hasEngExt1 && !hasEngAdv) {
    errors.push('English Extension 1 requires English Advanced.');
  }
  if (hasEngExt2 && !hasEngExt1) {
    errors.push('English Extension 2 requires English Extension 1.');
  }

  // 5. Science Unit Cap
  if (scienceUnits > 6) {
    warnings.push(`Maximum 6 units of Science can count toward ATAR. You have selected ${scienceUnits} units.`);
  }

  // 6. Category B Cap
  if (catBUnits > 2) {
    errors.push(`Maximum 2 units of Category B courses allowed. You have selected ${catBUnits} units.`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

export interface UnitContribution {
  courseId: string;
  courseName: string;
  unitNumber: number; // 1 or 2
  scaledScorePerUnit: number;
  isIncludedInBest10: boolean;
  isEnglish: boolean;
}

// Calculate Best 10 Units Aggregate Score
export function calculateBest10UnitsAggregate(selectedCourses: SelectedCourse[]): {
  aggregate: number;
  atar: number;
  unitBreakdown: UnitContribution[];
} {
  const unitContributions: UnitContribution[] = [];

  selectedCourses.forEach((sc) => {
    const course = HSC_COURSES.find((c) => c.id === sc.courseId);
    if (!course) return;

    // Determine effective units & scaled mark per unit
    const scaledPerUnit = getScaledMarkPerUnit(course, sc.rawMark);

    // If Maths Ext 2 is selected with Ext 1: Ext 1 counts as 2u + Ext 2 counts as 2u
    let effectiveUnits = course.units;
    if (course.id === 'math_ext1' && selectedCourses.some((item) => item.courseId === 'math_ext2')) {
      effectiveUnits = 2; // Ext 1 is 2 units when taken with Ext 2
    }

    for (let u = 1; u <= effectiveUnits; u++) {
      unitContributions.push({
        courseId: course.id,
        courseName: course.name,
        unitNumber: u,
        scaledScorePerUnit: scaledPerUnit,
        isIncludedInBest10: false,
        isEnglish: course.category === 'English',
      });
    }
  });

  // Select 2 compulsory English units with highest score
  const englishUnits = unitContributions
    .filter((u) => u.isEnglish)
    .sort((a, b) => b.scaledScorePerUnit - a.scaledScorePerUnit);

  const chosenEnglish = englishUnits.slice(0, 2);
  chosenEnglish.forEach((u) => (u.isIncludedInBest10 = true));

  // Remaining candidate units (non-chosen English + other subjects)
  const remainingUnits = unitContributions
    .filter((u) => !chosenEnglish.includes(u))
    .sort((a, b) => b.scaledScorePerUnit - a.scaledScorePerUnit);

  // Take remaining top 8 units (total 10 units)
  const chosenRemaining = remainingUnits.slice(0, 8);
  chosenRemaining.forEach((u) => (u.isIncludedInBest10 = true));

  // Calculate total aggregate out of 500 (10 units * 50 max score per unit)
  const best10 = [...chosenEnglish, ...chosenRemaining];
  const aggregate = best10.reduce((acc, u) => acc + u.scaledScorePerUnit, 0);
  const atar = aggregateToAtar(aggregate);

  return {
    aggregate: Math.round(aggregate * 10) / 10,
    atar: Math.round(atar * 100) / 100,
    unitBreakdown: unitContributions,
  };
}

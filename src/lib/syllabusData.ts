// ============================================================
// GirraStudy — HSC & Preliminary Syllabus Dot Points
// Source: NESA NSW HSC & Preliminary Syllabus (https://www.nesa.nsw.edu.au)
// Covers all 20 pre-seeded HSC subjects with Year 11 and Year 12 modules.
// ============================================================

export interface SyllabusDotPoint {
  id: string;
  subjectCode: string;
  yearGroup: 'Year 11' | 'Year 12';
  topic: string;
  dotPoint: string;
}

export const SYLLABUS_DATA: SyllabusDotPoint[] = [
  {
    "id": "ea11_1",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 11",
    "topic": "Reading to Write",
    "dotPoint": "Analyse how composers use language features, form and structure to shape meaning in complex texts."
  },
  {
    "id": "ea11_2",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 11",
    "topic": "Reading to Write",
    "dotPoint": "Experiment with stylistic techniques and language devices in response to reading experiences."
  },
  {
    "id": "ea11_3",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 11",
    "topic": "Module A: Contemporary Possibilities",
    "dotPoint": "Examine how digital and multimodal texts create possibilities for new forms of storytelling."
  },
  {
    "id": "ea11_4",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 11",
    "topic": "Module B: Close Study of Literature",
    "dotPoint": "Engage in close analysis of a prescribed literary text to develop a personal critical perspective."
  },
  {
    "id": "ea12_1",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 12",
    "topic": "Common Module: Texts and Human Experiences",
    "dotPoint": "Analyse how individual and collective human experiences are represented in prescribed and related texts."
  },
  {
    "id": "ea12_2",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 12",
    "topic": "Common Module: Texts and Human Experiences",
    "dotPoint": "Evaluate how human qualities and emotions arising from experiences are communicated through language."
  },
  {
    "id": "ea12_3",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 12",
    "topic": "Module A: Textual Conversations",
    "dotPoint": "Examine the resonances and dissonances between two texts through comparative analysis."
  },
  {
    "id": "ea12_4",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 12",
    "topic": "Module B: Critical Study of Literature",
    "dotPoint": "Assess the textual integrity and enduring cultural value of the prescribed text."
  },
  {
    "id": "ea12_5",
    "subjectCode": "ENG_ADV",
    "yearGroup": "Year 12",
    "topic": "Module C: The Craft of Writing",
    "dotPoint": "Compose imaginative, persuasive, discursive or informative texts using refined stylistic choices."
  },
  {
    "id": "es11_1",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 11",
    "topic": "Reading to Write",
    "dotPoint": "Explore language, identity and culture through reading and composing diverse text types."
  },
  {
    "id": "es11_2",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 11",
    "topic": "Module A: Contemporary Possibilities",
    "dotPoint": "Analyse how multimodal and digital texts engage audiences and communicate perspectives."
  },
  {
    "id": "es11_3",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 11",
    "topic": "Module B: Close Study of Literature",
    "dotPoint": "Conduct close reading of a literary text to articulate personal interpretations."
  },
  {
    "id": "es12_1",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 12",
    "topic": "Common Module: Texts and Human Experiences",
    "dotPoint": "Explore how texts represent human experiences, emotions, anomalies, paradoxes and inconsistencies."
  },
  {
    "id": "es12_2",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 12",
    "topic": "Module A: Language, Identity and Culture",
    "dotPoint": "Analyse how language shapes individual and community identity across diverse cultural contexts."
  },
  {
    "id": "es12_3",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 12",
    "topic": "Module B: Close Study of Literature",
    "dotPoint": "Develop a sustained personal response to a prescribed prose, poetry, drama or non-fiction text."
  },
  {
    "id": "es12_4",
    "subjectCode": "ENG_STD",
    "yearGroup": "Year 12",
    "topic": "Module C: Craft of Writing",
    "dotPoint": "Compose expressive and purposeful texts applying skills developed through text analysis."
  },
  {
    "id": "ee1_11_1",
    "subjectCode": "ENG_EXT1",
    "yearGroup": "Year 11",
    "topic": "Module: Literary Worlds",
    "dotPoint": "Examine how literary texts construct imaginative, speculative or historical worlds."
  },
  {
    "id": "ee1_12_1",
    "subjectCode": "ENG_EXT1",
    "yearGroup": "Year 12",
    "topic": "Common Module: Literary Worlds",
    "dotPoint": "Investigate how composers transform literary conventions to challenge cultural paradigms."
  },
  {
    "id": "ee1_12_2",
    "subjectCode": "ENG_EXT1",
    "yearGroup": "Year 12",
    "topic": "Elective: Worlds of Upheaval",
    "dotPoint": "Analyse how literature responds to political, social and philosophical revolutions."
  },
  {
    "id": "ee2_12_1",
    "subjectCode": "ENG_EXT2",
    "yearGroup": "Year 12",
    "topic": "Major Work Development",
    "dotPoint": "Formulate a rigorous proposal, draft, and refine an independent Major Work composition."
  },
  {
    "id": "ee2_12_2",
    "subjectCode": "ENG_EXT2",
    "yearGroup": "Year 12",
    "topic": "Reflection Statement",
    "dotPoint": "Compose a critical Reflection Statement detailing theoretical, stylistic and investigative choices."
  },
  {
    "id": "ma11_1",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 11",
    "topic": "Working with Functions",
    "dotPoint": "Define function domain and range, interval notation, and sketch linear, quadratic and cubic functions."
  },
  {
    "id": "ma11_2",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 11",
    "topic": "Trigonometry & Measure of Angles",
    "dotPoint": "Apply sine, cosine and area rules; convert between degrees and radians and solve trigonometric equations."
  },
  {
    "id": "ma11_3",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 11",
    "topic": "Introduction to Differentiation",
    "dotPoint": "Understand secant lines, gradient of tangent, first principles, and apply the power rule."
  },
  {
    "id": "ma11_4",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 11",
    "topic": "Exponential & Logarithmic Functions",
    "dotPoint": "Graph exponential curves y = a^x and log functions; apply index laws and logarithmic identities."
  },
  {
    "id": "ma11_5",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 11",
    "topic": "Probability & Discrete Data",
    "dotPoint": "Calculate relative frequency, conditional probability, tree diagrams and Venn diagrams."
  },
  {
    "id": "ma12_1",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Graphing Techniques",
    "dotPoint": "Apply transformations y = f(x \u00b1 c), y = a f(x) and sketch reciprocal and absolute value functions."
  },
  {
    "id": "ma12_2",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Trigonometric Functions & Calculus",
    "dotPoint": "Differentiate sin(x), cos(x), tan(x) and integrate standard trigonometric expressions."
  },
  {
    "id": "ma12_3",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Differential Calculus Applications",
    "dotPoint": "Apply product, quotient, chain rules; find stationary points, inflection points, and solve optimization."
  },
  {
    "id": "ma12_4",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Integral Calculus",
    "dotPoint": "Evaluate definite integrals, area bounded by curves, and trapezoidal rule approximations."
  },
  {
    "id": "ma12_5",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Financial Mathematics",
    "dotPoint": "Model compound interest, annuities, investments, loans and present/future value tables."
  },
  {
    "id": "ma12_6",
    "subjectCode": "MATH_ADV",
    "yearGroup": "Year 12",
    "topic": "Random Variables & Normal Dist",
    "dotPoint": "Calculate mean, variance, standard deviation of continuous random variables and z-scores for Normal Distribution."
  },
  {
    "id": "me1_11_1",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 11",
    "topic": "Further Work with Functions",
    "dotPoint": "Solve polynomial equations, remainder and factor theorems, sum and product of roots."
  },
  {
    "id": "me1_11_2",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 11",
    "topic": "Polynomials & Inequalities",
    "dotPoint": "Graph higher degree polynomials and solve non-linear inequalities algebraically and graphically."
  },
  {
    "id": "me1_11_3",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 11",
    "topic": "Inverse Trigonometric Functions",
    "dotPoint": "Define restriction domains, ranges, and sketch graphs of sin^-1(x), cos^-1(x) and tan^-1(x)."
  },
  {
    "id": "me1_11_4",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 11",
    "topic": "Permutations & Combinations",
    "dotPoint": "Apply counting principles, permutations nPr, combinations nCr, and arrangements in a circle."
  },
  {
    "id": "me1_12_1",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Proof by Mathematical Induction",
    "dotPoint": "Construct formal 3-step mathematical induction proofs for series sums, divisibility, and inequalities."
  },
  {
    "id": "me1_12_2",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Vectors in 2D",
    "dotPoint": "Represent position vectors, calculate dot product, projections, and solve geometric vector proofs."
  },
  {
    "id": "me1_12_3",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Trigonometric Identities & Equations",
    "dotPoint": "Apply t-formulae (t = tan \u03b8/2) and auxiliary angle form R sin(\u03b8 \u00b1 \u03b1) to solve equations."
  },
  {
    "id": "me1_12_4",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Calculus & Rates of Change",
    "dotPoint": "Solve related rates of change problems and integrate using integration by substitution."
  },
  {
    "id": "me1_12_5",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Projectile Motion",
    "dotPoint": "Derive parametric equations of motion x(t), y(t), trajectory equation, range, maximum height and flight time."
  },
  {
    "id": "me1_12_6",
    "subjectCode": "MATH_EXT1",
    "yearGroup": "Year 12",
    "topic": "Binomial Distribution",
    "dotPoint": "Calculate binomial probabilities P(X = k) = nCk p^k (1-p)^(n-k), mean np, and variance np(1-p)."
  },
  {
    "id": "me2_12_1",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "Complex Numbers",
    "dotPoint": "Perform arithmetic in Cartesian, mod-arg, and Euler form e^(i\u03b8); sketch loci in the Argand plane."
  },
  {
    "id": "me2_12_2",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "De Moivre Theorem & Roots of Unity",
    "dotPoint": "Apply De Moivre Theorem to find powers, nth roots of unity, and solve complex polynomial equations."
  },
  {
    "id": "me2_12_3",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "Advanced Proof & Inequalities",
    "dotPoint": "Construct rigorous direct, contradiction, contrapositive and AM-GM inequality proofs."
  },
  {
    "id": "me2_12_4",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "Vectors in 3D",
    "dotPoint": "Perform 3D vector operations, cross product, vector line equations, and plane vector equations."
  },
  {
    "id": "me2_12_5",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "Advanced Integration",
    "dotPoint": "Integrate using partial fractions, trig substitution, reduction formulae, and integration by parts."
  },
  {
    "id": "me2_12_6",
    "subjectCode": "MATH_EXT2",
    "yearGroup": "Year 12",
    "topic": "Mechanics & Differential Equations",
    "dotPoint": "Model resisted motion (v dv/dx, dv/dt = f(v)), simple harmonic motion, and circular motion."
  },
  {
    "id": "ch11_1",
    "subjectCode": "CHEM",
    "yearGroup": "Year 11",
    "topic": "Module 1: Properties & Structure of Matter",
    "dotPoint": "Separate mixtures based on physical properties, calculate isotopic abundances and atomic mass."
  },
  {
    "id": "ch11_2",
    "subjectCode": "CHEM",
    "yearGroup": "Year 11",
    "topic": "Module 1: Properties & Structure of Matter",
    "dotPoint": "Compare ionic, covalent molecular, covalent network and metallic bonding, Lewis dot diagrams and VSEPR shapes."
  },
  {
    "id": "ch11_3",
    "subjectCode": "CHEM",
    "yearGroup": "Year 11",
    "topic": "Module 2: Quantitative Chemistry",
    "dotPoint": "Perform mole calculations, empirical/molecular formula, stoichometry, gas laws (PV = nRT) and molar concentration."
  },
  {
    "id": "ch11_4",
    "subjectCode": "CHEM",
    "yearGroup": "Year 11",
    "topic": "Module 3: Reactive Chemistry",
    "dotPoint": "Construct metal activity series, write half-equations for galvanic cells, and balance net ionic equations."
  },
  {
    "id": "ch11_5",
    "subjectCode": "CHEM",
    "yearGroup": "Year 11",
    "topic": "Module 4: Drivers of Reactions",
    "dotPoint": "Calculate enthalpy change (q = m c \u0394T, Hess Law), entropy \u0394S, and Gibbs Free Energy (\u0394G = \u0394H - T\u0394S) for spontaneity."
  },
  {
    "id": "ch12_1",
    "subjectCode": "CHEM",
    "yearGroup": "Year 12",
    "topic": "Module 5: Equilibrium & Acid Reactions",
    "dotPoint": "Apply Le Chatelier Principle to collision theory, equilibrium constant Keq, and solubility product Ksp."
  },
  {
    "id": "ch12_2",
    "subjectCode": "CHEM",
    "yearGroup": "Year 12",
    "topic": "Module 6: Acid/Base Reactions",
    "dotPoint": "Analyse Bronsted-Lowry theory, pH, Ka, Kb, volumetric titrations, indicators, and buffer solutions."
  },
  {
    "id": "ch12_3",
    "subjectCode": "CHEM",
    "yearGroup": "Year 12",
    "topic": "Module 7: Organic Chemistry",
    "dotPoint": "IUPAC nomenclature for alkanes, alkenes, alkynes, haloalkanes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines."
  },
  {
    "id": "ch12_4",
    "subjectCode": "CHEM",
    "yearGroup": "Year 12",
    "topic": "Module 7: Organic Chemistry",
    "dotPoint": "Synthesise polymers (addition vs condensation) and evaluate organic reaction pathways for primary/secondary alcohols."
  },
  {
    "id": "ch12_5",
    "subjectCode": "CHEM",
    "yearGroup": "Year 12",
    "topic": "Module 8: Applying Chemical Ideas",
    "dotPoint": "Analyse qualitative tests for inorganic cations/anions, flame tests, NMR spectroscopy, IR spectroscopy, and Mass Spectrometry."
  },
  {
    "id": "ph11_1",
    "subjectCode": "PHYS",
    "yearGroup": "Year 11",
    "topic": "Module 1: Kinematics",
    "dotPoint": "Analyse 1D and 2D motion graphs (s-t, v-t, a-t), vector addition/subtraction, and relative velocity."
  },
  {
    "id": "ph11_2",
    "subjectCode": "PHYS",
    "yearGroup": "Year 11",
    "topic": "Module 2: Dynamics",
    "dotPoint": "Apply Newton laws of motion, momentum conservation, impulse (J = F \u0394t), work, energy, power, and friction on inclines."
  },
  {
    "id": "ph11_3",
    "subjectCode": "PHYS",
    "yearGroup": "Year 11",
    "topic": "Module 3: Waves & Thermodynamics",
    "dotPoint": "Analyse transverse/longitudinal waves, Snell Law of refraction, total internal reflection, interference, and specific heat capacity."
  },
  {
    "id": "ph11_4",
    "subjectCode": "PHYS",
    "yearGroup": "Year 11",
    "topic": "Module 4: Electricity & Magnetism",
    "dotPoint": "Apply Coulomb Law, electric field intensity E = F/q, Ohm Law, DC series/parallel circuits, and magnetic force F = qvB sin \u03b8."
  },
  {
    "id": "ph12_1",
    "subjectCode": "PHYS",
    "yearGroup": "Year 12",
    "topic": "Module 5: Advanced Mechanics",
    "dotPoint": "Solve 2D projectile motion problems, uniform circular motion (Fc = mv^2/r), torque, and Kepler Laws of planetary motion."
  },
  {
    "id": "ph12_2",
    "subjectCode": "PHYS",
    "yearGroup": "Year 12",
    "topic": "Module 6: Electromagnetism",
    "dotPoint": "Analyse motor effect (F = BIL sin \u03b8), Faraday Law of induction, Lenz Law, AC/DC motors, generators, and transformers."
  },
  {
    "id": "ph12_3",
    "subjectCode": "PHYS",
    "yearGroup": "Year 12",
    "topic": "Module 7: Nature of Light",
    "dotPoint": "Examine Maxwell electromagnetic wave theory, Young Double Slit interference, Photoelectric Effect (E = hf), and Special Relativity."
  },
  {
    "id": "ph12_4",
    "subjectCode": "PHYS",
    "yearGroup": "Year 12",
    "topic": "Module 8: From the Universe to Atom",
    "dotPoint": "Investigate Thomson, Rutherford, Bohr atomic models, De Broglie matter waves, Balmer series, nuclear decay, and Standard Model of Quarks."
  },
  {
    "id": "bi11_1",
    "subjectCode": "BIOL",
    "yearGroup": "Year 11",
    "topic": "Module 1: Cells as Basis of Life",
    "dotPoint": "Examine organelle structures under light/electron microscopes, fluid mosaic membrane model, passive/active transport."
  },
  {
    "id": "bi11_2",
    "subjectCode": "BIOL",
    "yearGroup": "Year 11",
    "topic": "Module 1: Cells as Basis of Life",
    "dotPoint": "Investigate enzyme action, lock-and-key vs induced fit models, and factors affecting enzyme activity (pH, temp, concentration)."
  },
  {
    "id": "bi11_3",
    "subjectCode": "BIOL",
    "yearGroup": "Year 11",
    "topic": "Module 2: Organisation of Living Things",
    "dotPoint": "Compare nutrient/gas exchange in autotrophs vs heterotrophs, open vs closed circulatory systems, xylem/phloem transport."
  },
  {
    "id": "bi11_4",
    "subjectCode": "BIOL",
    "yearGroup": "Year 11",
    "topic": "Module 3: Biological Diversity",
    "dotPoint": "Analyse selection pressures, adaptations (structural, physiological, behavioural), Darwin-Wallace theory of evolution by natural selection."
  },
  {
    "id": "bi11_5",
    "subjectCode": "BIOL",
    "yearGroup": "Year 11",
    "topic": "Module 4: Ecosystem Dynamics",
    "dotPoint": "Investigate ecological niches, food webs, biomass pyramids, radiometric dating, and human impact on ecosystems."
  },
  {
    "id": "bi12_1",
    "subjectCode": "BIOL",
    "yearGroup": "Year 12",
    "topic": "Module 5: Heredity",
    "dotPoint": "Analyse sexual vs asexual reproduction, mitosis vs meiosis, DNA replication, polypeptide synthesis (transcription/translation), and pedigree charts."
  },
  {
    "id": "bi12_2",
    "subjectCode": "BIOL",
    "yearGroup": "Year 12",
    "topic": "Module 6: Genetic Change",
    "dotPoint": "Investigate point/chromosomal mutations, non-coding DNA, gene flow, genetic drift, recombinant DNA technology, and CRISPR."
  },
  {
    "id": "bi12_3",
    "subjectCode": "BIOL",
    "yearGroup": "Year 12",
    "topic": "Module 7: Infectious Disease",
    "dotPoint": "Describe pathogen transmission (prions, viruses, bacteria, fungi, protozoa), plant/animal immune responses, 1st/2nd/3rd lines of defence."
  },
  {
    "id": "bi12_4",
    "subjectCode": "BIOL",
    "yearGroup": "Year 12",
    "topic": "Module 8: Non-infectious Disease",
    "dotPoint": "Analyse causes and effects of non-infectious diseases (genetic, environmental, nutritional), epidemiology, and hearing/visual assistance tech."
  },
  {
    "id": "ec11_1",
    "subjectCode": "ECON",
    "yearGroup": "Year 11",
    "topic": "Module 1: Intro to Economics",
    "dotPoint": "Explain economic problem of scarcity, opportunity cost, production possibility frontiers (PPF), and future implications of choices."
  },
  {
    "id": "ec11_2",
    "subjectCode": "ECON",
    "yearGroup": "Year 11",
    "topic": "Module 2: Consumers & Business",
    "dotPoint": "Analyse consumer sovereignty, MPC/MPS, business decision-making, production costs, and economies/diseconomies of scale."
  },
  {
    "id": "ec11_3",
    "subjectCode": "ECON",
    "yearGroup": "Year 11",
    "topic": "Module 3: Markets & Demand/Supply",
    "dotPoint": "Determine market equilibrium, price mechanism, price elasticity of demand/supply, market structures (pure competition to monopoly)."
  },
  {
    "id": "ec11_4",
    "subjectCode": "ECON",
    "yearGroup": "Year 11",
    "topic": "Module 4: Labour Markets",
    "dotPoint": "Examine demand/supply for labour, wage outcomes, enterprise bargaining, awards, and trade union/employer association roles."
  },
  {
    "id": "ec11_5",
    "subjectCode": "ECON",
    "yearGroup": "Year 11",
    "topic": "Module 5: Financial Markets & Government",
    "dotPoint": "Analyse money market, RBA cash rate policy, government re-allocation of resources, taxation types, and budget stances."
  },
  {
    "id": "ec12_1",
    "subjectCode": "ECON",
    "yearGroup": "Year 12",
    "topic": "Topic 1: The Global Economy",
    "dotPoint": "Examine gross world product, globalisation, trade flows, financial flows, protectionism, trade agreements (WTO, ASEAN, USMCA)."
  },
  {
    "id": "ec12_2",
    "subjectCode": "ECON",
    "yearGroup": "Year 12",
    "topic": "Topic 2: Australia in the Global Economy",
    "dotPoint": "Analyse Australia Balance of Payments (Current Account CAD, Capital/Financial Account), exchange rates, terms of trade, and foreign debt."
  },
  {
    "id": "ec12_3",
    "subjectCode": "ECON",
    "yearGroup": "Year 12",
    "topic": "Topic 3: Economic Issues",
    "dotPoint": "Evaluate economic growth, price stability (2-3% inflation target), unemployment types (cyclical, structural), income inequality (Lorenz curve/Gini)."
  },
  {
    "id": "ec12_4",
    "subjectCode": "ECON",
    "yearGroup": "Year 12",
    "topic": "Topic 4: Economic Policies & Management",
    "dotPoint": "Assess macroeconomic policies (Monetary Policy & Fiscal Policy stance) and microeconomic reform (deregulation, privatisation)."
  },
  {
    "id": "bs11_1",
    "subjectCode": "BUSS",
    "yearGroup": "Year 11",
    "topic": "Topic 1: Nature of Business",
    "dotPoint": "Examine role of business, classification by size/industry/legal structure, and business life cycle stages (establishment to post-maturity)."
  },
  {
    "id": "bs11_2",
    "subjectCode": "BUSS",
    "yearGroup": "Year 11",
    "topic": "Topic 2: Business Management",
    "dotPoint": "Analyse classical, behavioural and contingency management approaches, POLC functions, and managing change."
  },
  {
    "id": "bs11_3",
    "subjectCode": "BUSS",
    "yearGroup": "Year 11",
    "topic": "Topic 3: Business Planning",
    "dotPoint": "Prepare SME business plan components: executive summary, SWOT, market analysis, financial planning, and break-even calculation."
  },
  {
    "id": "bs12_1",
    "subjectCode": "BUSS",
    "yearGroup": "Year 12",
    "topic": "Topic 1: Operations",
    "dotPoint": "Evaluate operations strategies: performance objectives (quality, speed, cost), supply chain management, inventory (JIT), outsourcing."
  },
  {
    "id": "bs12_2",
    "subjectCode": "BUSS",
    "yearGroup": "Year 12",
    "topic": "Topic 2: Marketing",
    "dotPoint": "Analyse marketing processes (situational analysis, market research, target market) and 7Ps marketing strategies."
  },
  {
    "id": "bs12_3",
    "subjectCode": "BUSS",
    "yearGroup": "Year 12",
    "topic": "Topic 3: Finance",
    "dotPoint": "Interpret financial statements (Balance Sheet, Income Statement, Cash Flow) and ratio analysis (liquidity, gearing, profitability, efficiency)."
  },
  {
    "id": "bs12_4",
    "subjectCode": "BUSS",
    "yearGroup": "Year 12",
    "topic": "Topic 4: Human Resources",
    "dotPoint": "Evaluate HR processes (acquisition, development, maintenance, separation), workplace disputes, performance management, and HR effectiveness indicators."
  },
  {
    "id": "ls11_1",
    "subjectCode": "LEGL",
    "yearGroup": "Year 11",
    "topic": "Part I: The Legal System",
    "dotPoint": "Distinguish between justice, fairness, equality; legal sources (common law, statute law, customary law, international law)."
  },
  {
    "id": "ls11_2",
    "subjectCode": "LEGL",
    "yearGroup": "Year 11",
    "topic": "Part II: Individual & Law",
    "dotPoint": "Examine rights and responsibilities, dispute resolution mechanisms (ADR, tribunals, courts), and law enforcement agencies."
  },
  {
    "id": "ls11_3",
    "subjectCode": "LEGL",
    "yearGroup": "Year 11",
    "topic": "Part III: Law in Practice",
    "dotPoint": "Investigate a contemporary legal issue evaluating effectiveness of legal and non-legal responses in achieving justice."
  },
  {
    "id": "ls12_1",
    "subjectCode": "LEGL",
    "yearGroup": "Year 12",
    "topic": "Core 1: Crime",
    "dotPoint": "Analyse nature of crime (actus reus, mens rea), police powers, criminal trial process, sentencing guidelines, and post-sentencing options."
  },
  {
    "id": "ls12_2",
    "subjectCode": "LEGL",
    "yearGroup": "Year 12",
    "topic": "Core 2: Human Rights",
    "dotPoint": "Evaluate domestic (Constitution, statute, common law) and international (UN, ICC, treaties) human rights enforcement mechanisms."
  },
  {
    "id": "ls12_3",
    "subjectCode": "LEGL",
    "yearGroup": "Year 12",
    "topic": "Option: Family / Shelter / Consumers",
    "dotPoint": "Evaluate legal responses to contemporary family issues, consumer protection, or shelter provision."
  },
  {
    "id": "mh11_1",
    "subjectCode": "HIST_MOD",
    "yearGroup": "Year 11",
    "topic": "Investigating Modern History",
    "dotPoint": "Apply historical inquiry methods, evaluate primary/secondary source reliability, perspective, usefuless, and contestability."
  },
  {
    "id": "mh11_2",
    "subjectCode": "HIST_MOD",
    "yearGroup": "Year 11",
    "topic": "Historical Investigation",
    "dotPoint": "Plan and construct an independent historical investigation on a modern historical event or personality."
  },
  {
    "id": "mh12_1",
    "subjectCode": "HIST_MOD",
    "yearGroup": "Year 12",
    "topic": "Core: Power & Authority in Modern World",
    "dotPoint": "Analyse rise of fascist dictatorship in Weimar Germany, Nazi consolidation of power, totalitarian control, and WWII impact."
  },
  {
    "id": "mh12_2",
    "subjectCode": "HIST_MOD",
    "yearGroup": "Year 12",
    "topic": "National Studies (Russia/USA/China)",
    "dotPoint": "Examine political, social, economic developments and ideology in Bolshevik Russia, USA 1919-1941, or Cultural Revolution China."
  },
  {
    "id": "mh12_3",
    "subjectCode": "HIST_MOD",
    "yearGroup": "Year 12",
    "topic": "Peace & Conflict (WWI / Cold War)",
    "dotPoint": "Analyse alliance systems, Western Front trench warfare, home front mobilization, or Cold War crisis events."
  },
  {
    "id": "ah11_1",
    "subjectCode": "HIST_ANC",
    "yearGroup": "Year 11",
    "topic": "Investigating Ancient History",
    "dotPoint": "Analyse archaeological and written sources, preservation issues, ethical conservation, and historical reconstruction."
  },
  {
    "id": "ah11_2",
    "subjectCode": "HIST_ANC",
    "yearGroup": "Year 11",
    "topic": "Ancient Case Studies",
    "dotPoint": "Investigate key ancient sites, burials, or discoveries (e.g. Tutankhamun, Old Kingdom Pyramids, Troy)."
  },
  {
    "id": "ah12_1",
    "subjectCode": "HIST_ANC",
    "yearGroup": "Year 12",
    "topic": "Core: Cities of Vesuvius (Pompeii & Herculaneum)",
    "dotPoint": "Examine eruption evidence, streetscapes, public buildings, private houses, economy, religion, and ethical conservation issues."
  },
  {
    "id": "ah12_2",
    "subjectCode": "HIST_ANC",
    "yearGroup": "Year 12",
    "topic": "Personalities in their Times",
    "dotPoint": "Evaluate political, military, cultural achievements and historiography of key personalities (e.g. Hatshepsut, Julius Caesar, Pericles)."
  },
  {
    "id": "ah12_3",
    "subjectCode": "HIST_ANC",
    "yearGroup": "Year 12",
    "topic": "Ancient Societies (Sparta/Rome/Egypt)",
    "dotPoint": "Analyse social structure, political organisation, military system, economy, and religion of the chosen ancient society."
  },
  {
    "id": "se11_1",
    "subjectCode": "SOFT_ENG",
    "yearGroup": "Year 11",
    "topic": "Programming Fundamentals",
    "dotPoint": "Write clean code using sequence, selection (if-else, switch), iteration (for, while), functions, arrays, and algorithms."
  },
  {
    "id": "se11_2",
    "subjectCode": "SOFT_ENG",
    "yearGroup": "Year 11",
    "topic": "Software Hardware Options",
    "dotPoint": "Explain relationship between hardware architecture, CPU registers, memory (RAM/ROM), fetch-execute cycle, and compilers."
  },
  {
    "id": "se12_1",
    "subjectCode": "SOFT_ENG",
    "yearGroup": "Year 12",
    "topic": "Software Development Approaches",
    "dotPoint": "Compare Waterfall, Agile, Lean, RAD, and Prototyping software engineering lifecycles."
  },
  {
    "id": "se12_2",
    "subjectCode": "SOFT_ENG",
    "yearGroup": "Year 12",
    "topic": "OOP & Data Structures",
    "dotPoint": "Implement Classes, Inheritance, Encapsulation, Polymorphism, Stacks, Queues, Linked Lists, Trees, and Big-O complexity."
  },
  {
    "id": "se12_3",
    "subjectCode": "SOFT_ENG",
    "yearGroup": "Year 12",
    "topic": "Software Project Engineering",
    "dotPoint": "Plan, test (unit/integration/system testing), debug, and deploy a full-scale software project."
  },
  {
    "id": "engs11_1",
    "subjectCode": "ENG_STUD",
    "yearGroup": "Year 11",
    "topic": "Engineering Fundamentals",
    "dotPoint": "Apply concurrent force systems, vector resolution, moments of force, stress/strain equations (\u03c3 = F/A, \u03b5 = \u0394L/L)."
  },
  {
    "id": "engs11_2",
    "subjectCode": "ENG_STUD",
    "yearGroup": "Year 11",
    "topic": "Engineering Products & Tools",
    "dotPoint": "Examine materials testing (tensile test, hardness test), heat treatment processes, and engineering drawing standards."
  },
  {
    "id": "engs12_1",
    "subjectCode": "ENG_STUD",
    "yearGroup": "Year 12",
    "topic": "Civil & Aeronautical Engineering",
    "dotPoint": "Analyse truss structures (method of sections/joints), Bernoulli principle, lift/drag forces, and aircraft propulsion systems."
  },
  {
    "id": "engs12_2",
    "subjectCode": "ENG_STUD",
    "yearGroup": "Year 12",
    "topic": "Telecommunications & Biomedical",
    "dotPoint": "Evaluate satellite communications, fibre optics, digital signal processing, biomaterials, and prosthetic mechanics."
  },
  {
    "id": "ipt11_1",
    "subjectCode": "IPT",
    "yearGroup": "Year 11",
    "topic": "Introduction to Information Systems",
    "dotPoint": "Describe 7 information processes (collecting, organising, analysing, storing, processing, transmitting, displaying)."
  },
  {
    "id": "ipt11_2",
    "subjectCode": "IPT",
    "yearGroup": "Year 11",
    "topic": "Tools for Information Systems",
    "dotPoint": "Design Data Flow Diagrams (DFDs), System Flowcharts, Structure Charts, and Data Dictionaries."
  },
  {
    "id": "ipt12_1",
    "subjectCode": "IPT",
    "yearGroup": "Year 12",
    "topic": "Project Management & Databases",
    "dotPoint": "Design relational database schemas, 1NF/2NF/3NF normalisation, SQL SELECT queries, and Gantt chart scheduling."
  },
  {
    "id": "ipt12_2",
    "subjectCode": "IPT",
    "yearGroup": "Year 12",
    "topic": "Communication Systems",
    "dotPoint": "Analyse OSI 7-layer model, TCP/IP, network topologies (star, mesh, bus), wireless transmission, and encryption methods."
  },
  {
    "id": "pd11_1",
    "subjectCode": "PDHPE",
    "yearGroup": "Year 11",
    "topic": "Core 1: Better Health for Individuals",
    "dotPoint": "Examine meanings of health, dynamic nature of health, perceptions of health, and social determinants."
  },
  {
    "id": "pd11_2",
    "subjectCode": "PDHPE",
    "yearGroup": "Year 11",
    "topic": "Core 2: The Body in Motion",
    "dotPoint": "Analyse anatomical structure of skeletal/muscular systems, cardiorespiratory system, and biomechanical principles."
  },
  {
    "id": "pd12_1",
    "subjectCode": "PDHPE",
    "yearGroup": "Year 12",
    "topic": "Core 1: Health Priorities in Australia",
    "dotPoint": "Analyse epidemiology of cardiovascular disease, cancer, diabetes, Indigenous health inequities, and Ottawa Charter action areas."
  },
  {
    "id": "pd12_2",
    "subjectCode": "PDHPE",
    "yearGroup": "Year 12",
    "topic": "Core 2: Factors Affecting Performance",
    "dotPoint": "Evaluate energy systems (ATP-PC, Lactic Acid, Aerobic), training principles, nutrition, psychology, and recovery strategies."
  },
  {
    "id": "sor11_1",
    "subjectCode": "SOR",
    "yearGroup": "Year 11",
    "topic": "Nature of Religion & Belief Systems",
    "dotPoint": "Analyse characteristics of religion (beliefs/believers, sacred texts, ethics, rituals/ceremonies) and the Dreaming."
  },
  {
    "id": "sor11_2",
    "subjectCode": "SOR",
    "yearGroup": "Year 11",
    "topic": "Religious Tradition Studies (Y11)",
    "dotPoint": "Examine historical context, principal beliefs, sacred texts and core ethical teachings of chosen religious traditions."
  },
  {
    "id": "sor12_1",
    "subjectCode": "SOR",
    "yearGroup": "Year 12",
    "topic": "Religion and Belief Systems in Australia post-1945",
    "dotPoint": "Analyse religious landscape changes post-1945, immigration impact, denominational switching, secularism, and Native Title."
  },
  {
    "id": "sor12_2",
    "subjectCode": "SOR",
    "yearGroup": "Year 12",
    "topic": "Religious Depth Studies (Y12)",
    "dotPoint": "Investigate significant people/ideas, bioethics/environmental ethics, and significant practices in chosen religious traditions."
  }
];

// ============================================================
// GirraStudy — HSC Syllabus Dot Points
// Source: NESA NSW HSC Syllabus (https://www.nesa.nsw.edu.au)
// Covers all 20 pre-seeded HSC subjects.
// ============================================================

export interface SyllabusDotPoint {
  id: string;
  subjectCode: string;
  topic: string;
  dotPoint: string;
}

export const SYLLABUS_DATA: SyllabusDotPoint[] = [
  // ENGLISH ADVANCED (ENG_ADV)
  { id: 'ea1', subjectCode: 'ENG_ADV', topic: 'Texts and Human Experiences', dotPoint: 'Analyse the ways text structures, language features and modes shape meaning and influence responses.' },
  { id: 'ea2', subjectCode: 'ENG_ADV', topic: 'Texts and Human Experiences', dotPoint: 'Evaluate the effect of the interplay of structure, form and language on the construction of meaning.' },
  { id: 'ea3', subjectCode: 'ENG_ADV', topic: 'Texts and Human Experiences', dotPoint: 'Explain how and why individuals and groups are represented in and through texts.' },
  { id: 'ea4', subjectCode: 'ENG_ADV', topic: 'Texts and Human Experiences', dotPoint: 'Analyse how context, purpose, audience and form shape meaning in texts.' },
  { id: 'ea5', subjectCode: 'ENG_ADV', topic: 'Common Module — Writing', dotPoint: 'Compose extended texts that synthesise ideas from your prescribed and related texts.' },
  { id: 'ea6', subjectCode: 'ENG_ADV', topic: 'Module A — Textual Conversations', dotPoint: 'Examine how and why texts are in conversation with each other through shared concerns and perspectives.' },
  { id: 'ea7', subjectCode: 'ENG_ADV', topic: 'Module A — Textual Conversations', dotPoint: 'Evaluate how the composer of the later text has reframed or reinterpreted the original text.' },
  { id: 'ea8', subjectCode: 'ENG_ADV', topic: 'Module B — Critical Study of Literature', dotPoint: 'Evaluate the ways the text has been received and valued over time.' },
  { id: 'ea9', subjectCode: 'ENG_ADV', topic: 'Module B — Critical Study of Literature', dotPoint: 'Articulate and justify a personal critical perspective through close reading of the prescribed text.' },
  { id: 'ea10', subjectCode: 'ENG_ADV', topic: 'Module C — Craft of Writing', dotPoint: 'Experiment with language, form and structure to compose texts that shape meaning and engage readers.' },
  { id: 'ea11', subjectCode: 'ENG_ADV', topic: 'Module C — Craft of Writing', dotPoint: 'Analyse and evaluate the craft of writing in texts studied, applying insights to own compositions.' },

  // ENGLISH STANDARD (ENG_STD)
  { id: 'es1', subjectCode: 'ENG_STD', topic: 'Texts and Human Experiences', dotPoint: 'Explore how texts represent individual and collective human experiences.' },
  { id: 'es2', subjectCode: 'ENG_STD', topic: 'Texts and Human Experiences', dotPoint: 'Identify text structures and language features used in a variety of forms and modes.' },
  { id: 'es3', subjectCode: 'ENG_STD', topic: 'Texts and Human Experiences', dotPoint: 'Explain the significance of context in shaping the values and attitudes expressed in texts.' },
  { id: 'es4', subjectCode: 'ENG_STD', topic: 'Module A — Contemporary Possibilities', dotPoint: 'Explore the ways digital, multimodal and hybrid texts engage audiences in the modern world.' },
  { id: 'es5', subjectCode: 'ENG_STD', topic: 'Module A — Contemporary Possibilities', dotPoint: 'Discuss how texts communicate meaning through a combination of visual, auditory and textual elements.' },
  { id: 'es6', subjectCode: 'ENG_STD', topic: 'Module B — Close Study of Literature', dotPoint: 'Engage in close reading of a single literary text to develop a sustained personal interpretation.' },
  { id: 'es7', subjectCode: 'ENG_STD', topic: 'Module C — Writing and Representation', dotPoint: 'Compose a variety of texts that represent personal, social and cultural perspectives.' },
  { id: 'es8', subjectCode: 'ENG_STD', topic: 'Module C — Writing and Representation', dotPoint: 'Reflect on and evaluate the effectiveness of own compositions using metalanguage.' },

  // ENGLISH EXTENSION 1 (ENG_EXT1)
  { id: 'ee1_1', subjectCode: 'ENG_EXT1', topic: 'Texts, Culture and Value', dotPoint: 'Analyse the relationship between texts and the cultural, social and historical contexts of their production and reception.' },
  { id: 'ee1_2', subjectCode: 'ENG_EXT1', topic: 'Texts, Culture and Value', dotPoint: 'Evaluate how literary texts represent the complexities of human experience and the values that shape societies.' },
  { id: 'ee1_3', subjectCode: 'ENG_EXT1', topic: 'Literary Worlds', dotPoint: 'Examine how composers of literary texts construct worlds that reflect cultural assumptions and challenge readers.' },
  { id: 'ee1_4', subjectCode: 'ENG_EXT1', topic: 'Literary Worlds', dotPoint: 'Analyse the use of intertextuality and genre conventions to position readers and create meaning.' },
  { id: 'ee1_5', subjectCode: 'ENG_EXT1', topic: 'Critical Frameworks', dotPoint: 'Apply a range of critical frameworks (feminist, postcolonial, Marxist, psychoanalytic) to analyse texts.' },
  { id: 'ee1_6', subjectCode: 'ENG_EXT1', topic: 'Critical Frameworks', dotPoint: 'Evaluate the strengths and limitations of different critical approaches when applied to a single text.' },

  // ENGLISH EXTENSION 2 (ENG_EXT2)
  { id: 'ee2_1', subjectCode: 'ENG_EXT2', topic: 'Major Work', dotPoint: 'Produce a sustained, substantial and coherent composition demonstrating sophisticated control of language, form and structure.' },
  { id: 'ee2_2', subjectCode: 'ENG_EXT2', topic: 'Major Work', dotPoint: "Compose a writer's statement articulating the creative decisions, influences and critical underpinning of the major work." },
  { id: 'ee2_3', subjectCode: 'ENG_EXT2', topic: 'Composition Process', dotPoint: 'Document the processes of research, drafting, revision and reflection that informed the development of the major work.' },
  { id: 'ee2_4', subjectCode: 'ENG_EXT2', topic: 'Composition Process', dotPoint: 'Engage with the work of other composers and theorists to inform and extend your own creative practice.' },

  // MATHEMATICS ADVANCED (MATH_ADV)
  { id: 'ma1', subjectCode: 'MATH_ADV', topic: 'Functions', dotPoint: 'Understand the concept of a function and use function notation, domain and range.' },
  { id: 'ma2', subjectCode: 'MATH_ADV', topic: 'Functions', dotPoint: 'Identify and sketch polynomial, reciprocal, absolute value, exponential and logarithmic functions.' },
  { id: 'ma3', subjectCode: 'MATH_ADV', topic: 'Trigonometric Functions', dotPoint: 'Define trigonometric functions using the unit circle and sketch their graphs.' },
  { id: 'ma4', subjectCode: 'MATH_ADV', topic: 'Trigonometric Functions', dotPoint: 'Prove trigonometric identities including Pythagorean, double angle and sum-to-product formulas.' },
  { id: 'ma5', subjectCode: 'MATH_ADV', topic: 'Calculus — Differentiation', dotPoint: 'Apply the product rule, quotient rule and chain rule to differentiate composite functions.' },
  { id: 'ma6', subjectCode: 'MATH_ADV', topic: 'Calculus — Differentiation', dotPoint: 'Differentiate exponential, logarithmic and trigonometric functions.' },
  { id: 'ma7', subjectCode: 'MATH_ADV', topic: 'Calculus — Integration', dotPoint: 'Evaluate definite and indefinite integrals using standard antiderivatives and substitution.' },
  { id: 'ma8', subjectCode: 'MATH_ADV', topic: 'Calculus — Integration', dotPoint: 'Apply integration to find areas under curves and between two functions.' },
  { id: 'ma9', subjectCode: 'MATH_ADV', topic: 'Statistical Analysis', dotPoint: 'Calculate and interpret measures of central tendency and spread including variance and standard deviation.' },
  { id: 'ma10', subjectCode: 'MATH_ADV', topic: 'Statistical Analysis', dotPoint: 'Use the normal distribution to model continuous random variables and find probabilities.' },
  { id: 'ma11', subjectCode: 'MATH_ADV', topic: 'Financial Mathematics', dotPoint: 'Apply arithmetic and geometric sequences to financial problems including loans and superannuation.' },
  { id: 'ma12', subjectCode: 'MATH_ADV', topic: 'Exponential & Logarithmic Functions', dotPoint: 'Solve exponential equations and apply logarithms to growth and decay problems.' },

  // MATHEMATICS EXTENSION 1 (MATH_EXT1)
  { id: 'me1_1', subjectCode: 'MATH_EXT1', topic: 'Proof', dotPoint: 'Construct proofs by mathematical induction including divisibility, inequality and series proofs.' },
  { id: 'me1_2', subjectCode: 'MATH_EXT1', topic: 'Proof', dotPoint: 'Understand and apply direct proof, proof by contradiction and proof by contrapositive.' },
  { id: 'me1_3', subjectCode: 'MATH_EXT1', topic: 'Vectors', dotPoint: 'Represent vectors in two dimensions using component form and apply vector operations.' },
  { id: 'me1_4', subjectCode: 'MATH_EXT1', topic: 'Vectors', dotPoint: 'Use the dot product to determine angles between vectors and test for perpendicularity.' },
  { id: 'me1_5', subjectCode: 'MATH_EXT1', topic: 'Trigonometry & Further Functions', dotPoint: 'Apply t-substitution (half-angle formulae) to solve trigonometric equations and evaluate integrals.' },
  { id: 'me1_6', subjectCode: 'MATH_EXT1', topic: 'Trigonometry & Further Functions', dotPoint: 'Understand inverse trigonometric functions, their domains, ranges and derivatives.' },
  { id: 'me1_7', subjectCode: 'MATH_EXT1', topic: 'Combinatorics', dotPoint: 'Apply the Binomial theorem to expand (a+b)^n and use the pigeonhole principle.' },
  { id: 'me1_8', subjectCode: 'MATH_EXT1', topic: 'Combinatorics', dotPoint: 'Solve counting problems using permutations, combinations and inclusion-exclusion.' },
  { id: 'me1_9', subjectCode: 'MATH_EXT1', topic: 'Calculus', dotPoint: 'Apply integration by parts and further substitution techniques to evaluate complex integrals.' },
  { id: 'me1_10', subjectCode: 'MATH_EXT1', topic: 'Statistical Analysis', dotPoint: 'Understand discrete probability distributions including binomial and hypergeometric distributions.' },

  // MATHEMATICS EXTENSION 2 (MATH_EXT2)
  { id: 'me2_1', subjectCode: 'MATH_EXT2', topic: 'Proof', dotPoint: 'Construct proofs using complex numbers, vectors, and calculus arguments.' },
  { id: 'me2_2', subjectCode: 'MATH_EXT2', topic: 'Proof', dotPoint: 'Evaluate and critique mathematical arguments for logical validity and completeness.' },
  { id: 'me2_3', subjectCode: 'MATH_EXT2', topic: 'Complex Numbers', dotPoint: 'Represent complex numbers in Cartesian, polar (modulus-argument) and Euler exponential form.' },
  { id: 'me2_4', subjectCode: 'MATH_EXT2', topic: 'Complex Numbers', dotPoint: "Apply de Moivre's theorem to find powers and roots of complex numbers." },
  { id: 'me2_5', subjectCode: 'MATH_EXT2', topic: 'Complex Numbers', dotPoint: 'Sketch loci and regions in the Argand diagram defined by algebraic conditions on complex numbers.' },
  { id: 'me2_6', subjectCode: 'MATH_EXT2', topic: 'Vectors', dotPoint: 'Represent and manipulate vectors in three dimensions, including dot and cross products.' },
  { id: 'me2_7', subjectCode: 'MATH_EXT2', topic: 'Vectors', dotPoint: 'Determine vector equations of lines and planes in 3D and interpret their geometric meaning.' },
  { id: 'me2_8', subjectCode: 'MATH_EXT2', topic: 'Integration Techniques', dotPoint: 'Apply advanced integration: partial fractions, trigonometric substitution and reduction formulae.' },
  { id: 'me2_9', subjectCode: 'MATH_EXT2', topic: 'Mechanics', dotPoint: 'Model resisted motion, circular motion and simple harmonic motion using differential equations.' },
  { id: 'me2_10', subjectCode: 'MATH_EXT2', topic: 'Mechanics', dotPoint: 'Solve and interpret first-order and second-order differential equations in physical contexts.' },

  // CHEMISTRY (CHEM)
  { id: 'ch1', subjectCode: 'CHEM', topic: 'Properties & Structure of Matter', dotPoint: 'Explain the properties of matter in terms of atomic and bonding structure.' },
  { id: 'ch2', subjectCode: 'CHEM', topic: 'Properties & Structure of Matter', dotPoint: 'Compare properties of ionic, covalent molecular, covalent network and metallic substances.' },
  { id: 'ch3', subjectCode: 'CHEM', topic: 'Quantitative Chemistry', dotPoint: 'Apply the mole concept to calculate molar mass, concentration, percentage composition and empirical formulae.' },
  { id: 'ch4', subjectCode: 'CHEM', topic: 'Quantitative Chemistry', dotPoint: 'Plan and conduct titration experiments to determine the concentration of unknown solutions.' },
  { id: 'ch5', subjectCode: 'CHEM', topic: 'Reactive Chemistry', dotPoint: 'Describe and predict the products of combustion, precipitation, acid-base and redox reactions.' },
  { id: 'ch6', subjectCode: 'CHEM', topic: 'Reactive Chemistry', dotPoint: 'Write balanced ionic and half-equations for reactions in aqueous solution.' },
  { id: 'ch7', subjectCode: 'CHEM', topic: 'Drivers of Reactions', dotPoint: 'Apply enthalpy change, entropy and Gibbs free energy (DG = DH - TDS) to predict spontaneity.' },
  { id: 'ch8', subjectCode: 'CHEM', topic: 'Equilibrium & Acid/Base', dotPoint: "Apply Le Chatelier's principle to predict equilibrium shifts with changes in temperature, pressure and concentration." },
  { id: 'ch9', subjectCode: 'CHEM', topic: 'Equilibrium & Acid/Base', dotPoint: 'Calculate pH, Ka and Kb for weak acids and bases; solve buffer equilibrium problems.' },
  { id: 'ch10', subjectCode: 'CHEM', topic: 'Organic Chemistry', dotPoint: 'Name and draw structural formulae for hydrocarbons, alcohols, aldehydes, ketones, carboxylic acids, esters and amines.' },
  { id: 'ch11', subjectCode: 'CHEM', topic: 'Organic Chemistry', dotPoint: 'Analyse reaction pathways for primary, secondary and tertiary alcohols through oxidation reactions.' },
  { id: 'ch12', subjectCode: 'CHEM', topic: 'Organic Chemistry', dotPoint: 'Distinguish between addition, substitution, condensation and elimination reaction types.' },

  // PHYSICS (PHYS)
  { id: 'ph1', subjectCode: 'PHYS', topic: 'Kinematics', dotPoint: 'Analyse the relative motion between two objects using vector diagrams and relative velocity.' },
  { id: 'ph2', subjectCode: 'PHYS', topic: 'Kinematics', dotPoint: 'Solve projectile motion problems using independent horizontal and vertical components.' },
  { id: 'ph3', subjectCode: 'PHYS', topic: 'Dynamics', dotPoint: "Apply Newton's three laws of motion to analyse forces in static and dynamic systems." },
  { id: 'ph4', subjectCode: 'PHYS', topic: 'Dynamics', dotPoint: 'Resolve forces and apply equilibrium conditions to objects on inclines with friction.' },
  { id: 'ph5', subjectCode: 'PHYS', topic: 'Waves & Thermodynamics', dotPoint: 'Apply the wave model to explain reflection, refraction, diffraction and interference of light and sound.' },
  { id: 'ph6', subjectCode: 'PHYS', topic: 'Waves & Thermodynamics', dotPoint: 'Explain the photoelectric effect and its evidence for the particle nature of light.' },
  { id: 'ph7', subjectCode: 'PHYS', topic: 'Electricity & Magnetism', dotPoint: 'Analyse electric fields, potential difference and capacitance in parallel plate configurations.' },
  { id: 'ph8', subjectCode: 'PHYS', topic: 'Electricity & Magnetism', dotPoint: "Apply Lenz's law and Faraday's law to calculate induced EMF in rotating coils." },
  { id: 'ph9', subjectCode: 'PHYS', topic: 'Electricity & Magnetism', dotPoint: 'Describe the operation of AC generators, transformers and electromagnetic induction in energy transmission.' },
  { id: 'ph10', subjectCode: 'PHYS', topic: 'Special Relativity', dotPoint: 'Apply the postulates of special relativity to explain time dilation, length contraction and relativistic mass.' },
  { id: 'ph11', subjectCode: 'PHYS', topic: 'Special Relativity', dotPoint: 'Use the Lorentz factor and calculate relativistic quantities for particles at relativistic speeds.' },
  { id: 'ph12', subjectCode: 'PHYS', topic: 'From the Universe to the Atom', dotPoint: 'Describe the Standard Model of matter and explain the role of quarks, leptons and fundamental forces.' },
  { id: 'ph13', subjectCode: 'PHYS', topic: 'From the Universe to the Atom', dotPoint: 'Describe nuclear fission, fusion and radioactive decay; apply E = mc2 to calculate energy changes.' },

  // BIOLOGY (BIOL)
  { id: 'bi1', subjectCode: 'BIOL', topic: 'Cells as the Basis of Life', dotPoint: 'Describe the structure and function of organelles in prokaryotic and eukaryotic cells.' },
  { id: 'bi2', subjectCode: 'BIOL', topic: 'Cells as the Basis of Life', dotPoint: 'Explain how the fluid mosaic model of the cell membrane accounts for selective permeability.' },
  { id: 'bi3', subjectCode: 'BIOL', topic: 'Organisation of Living Things', dotPoint: 'Analyse the requirements for transport of nutrients and waste products in multicellular organisms.' },
  { id: 'bi4', subjectCode: 'BIOL', topic: 'Biological Diversity', dotPoint: 'Evaluate the theory of evolution by natural selection, including mutations and genetic drift.' },
  { id: 'bi5', subjectCode: 'BIOL', topic: 'Biological Diversity', dotPoint: 'Explain the biological species concept and analyse exceptions.' },
  { id: 'bi6', subjectCode: 'BIOL', topic: 'Heredity', dotPoint: "Apply Mendel's laws of segregation and independent assortment to solve genetics problems including dihybrid crosses." },
  { id: 'bi7', subjectCode: 'BIOL', topic: 'Heredity', dotPoint: 'Distinguish between autosomal and sex-linked inheritance and predict phenotypic ratios.' },
  { id: 'bi8', subjectCode: 'BIOL', topic: 'Infectious Disease', dotPoint: "Explain how pathogens cause disease and describe the body's non-specific and specific immune responses." },
  { id: 'bi9', subjectCode: 'BIOL', topic: 'Infectious Disease', dotPoint: 'Evaluate the role of vaccinations, antibiotics and antivirals in managing infectious disease.' },
  { id: 'bi10', subjectCode: 'BIOL', topic: 'Genetics: The Code Broken?', dotPoint: 'Describe the Central Dogma (DNA to RNA to Protein) and explain transcription and translation at the molecular level.' },
  { id: 'bi11', subjectCode: 'BIOL', topic: 'Genetics: The Code Broken?', dotPoint: 'Analyse applications of genetic technologies including gel electrophoresis, PCR, gene therapy and CRISPR.' },

  // ECONOMICS (ECON)
  { id: 'ec1', subjectCode: 'ECON', topic: 'Introduction to Economics', dotPoint: 'Explain the concept of scarcity and opportunity cost and apply these to resource allocation decisions.' },
  { id: 'ec2', subjectCode: 'ECON', topic: 'Introduction to Economics', dotPoint: 'Analyse the circular flow of income model and the role of households, firms, government and the external sector.' },
  { id: 'ec3', subjectCode: 'ECON', topic: 'Markets', dotPoint: 'Apply supply and demand analysis to explain price determination and market equilibrium.' },
  { id: 'ec4', subjectCode: 'ECON', topic: 'Markets', dotPoint: 'Explain price elasticity of demand and supply; calculate PED and evaluate implications for revenue.' },
  { id: 'ec5', subjectCode: 'ECON', topic: 'Labour Markets', dotPoint: 'Analyse the factors that determine wage outcomes and explain the role of bargaining and award structures.' },
  { id: 'ec6', subjectCode: 'ECON', topic: 'Economic Issues', dotPoint: 'Evaluate macroeconomic policies (monetary, fiscal, microeconomic reform) used to achieve sustained economic growth.' },
  { id: 'ec7', subjectCode: 'ECON', topic: 'Economic Issues', dotPoint: "Assess the effectiveness of the RBA's inflation targeting framework in maintaining price stability (2-3% target band)." },
  { id: 'ec8', subjectCode: 'ECON', topic: 'Economic Issues', dotPoint: 'Analyse the causes and consequences of unemployment and evaluate policies to reduce it.' },
  { id: 'ec9', subjectCode: 'ECON', topic: 'Global Economy', dotPoint: "Explain Australia's trade patterns, comparative advantage and the composition of imports and exports." },
  { id: 'ec10', subjectCode: 'ECON', topic: 'Global Economy', dotPoint: "Analyse the structure of Australia's Balance of Payments and evaluate the significance of the Current Account Deficit." },
  { id: 'ec11', subjectCode: 'ECON', topic: 'Global Economy', dotPoint: 'Assess the role of the IMF, World Bank and WTO in the global economic system.' },
  { id: 'ec12', subjectCode: 'ECON', topic: 'Economic Growth & Development', dotPoint: 'Distinguish between economic growth and development; evaluate GDP, HDI and GINI coefficient as measures.' },

  // BUSINESS STUDIES (BUSS)
  { id: 'bs1', subjectCode: 'BUSS', topic: 'Nature of Business', dotPoint: 'Explain the role of business in the economic system and analyse internal and external influences on business.' },
  { id: 'bs2', subjectCode: 'BUSS', topic: 'Nature of Business', dotPoint: 'Describe the different types of business structure and their legal obligations.' },
  { id: 'bs3', subjectCode: 'BUSS', topic: 'Business Management', dotPoint: 'Apply management theories and leadership styles to real-world business scenarios.' },
  { id: 'bs4', subjectCode: 'BUSS', topic: 'Business Management', dotPoint: 'Evaluate the effectiveness of strategies used to manage business change and resistance to change.' },
  { id: 'bs5', subjectCode: 'BUSS', topic: 'Marketing', dotPoint: 'Analyse the elements of the marketing mix (7Ps) and develop integrated marketing strategies for a target market.' },
  { id: 'bs6', subjectCode: 'BUSS', topic: 'Marketing', dotPoint: 'Evaluate the impact of technology and globalisation on marketing strategies and consumer behaviour.' },
  { id: 'bs7', subjectCode: 'BUSS', topic: 'Finance', dotPoint: 'Prepare and analyse income statements, balance sheets and cash flow statements.' },
  { id: 'bs8', subjectCode: 'BUSS', topic: 'Finance', dotPoint: 'Calculate and interpret financial ratios including liquidity, profitability, efficiency and leverage.' },
  { id: 'bs9', subjectCode: 'BUSS', topic: 'Human Resources', dotPoint: 'Explain the staffing process (acquisition, development, maintenance, separation) and HR strategies.' },
  { id: 'bs10', subjectCode: 'BUSS', topic: 'Human Resources', dotPoint: 'Evaluate performance management strategies and their effect on employee motivation and organisational goals.' },

  // LEGAL STUDIES (LEGL)
  { id: 'ls1', subjectCode: 'LEGL', topic: 'The Legal System', dotPoint: 'Explain the role of law in society and sources of law including common law, statute law and delegated legislation.' },
  { id: 'ls2', subjectCode: 'LEGL', topic: 'The Legal System', dotPoint: 'Describe the structure of the Australian court hierarchy and the principle of precedent (stare decisis).' },
  { id: 'ls3', subjectCode: 'LEGL', topic: 'The Legal System', dotPoint: 'Analyse the distinction between criminal law and civil law, including burden and standard of proof.' },
  { id: 'ls4', subjectCode: 'LEGL', topic: 'Crime', dotPoint: 'Identify the elements of a crime (actus reus and mens rea) and evaluate available defences.' },
  { id: 'ls5', subjectCode: 'LEGL', topic: 'Crime', dotPoint: 'Assess the effectiveness of the criminal justice system in achieving just outcomes for victims, offenders and society.' },
  { id: 'ls6', subjectCode: 'LEGL', topic: 'Human Rights', dotPoint: 'Explain the origin, development and enforcement of international human rights instruments.' },
  { id: 'ls7', subjectCode: 'LEGL', topic: 'Human Rights', dotPoint: 'Evaluate the effectiveness of domestic and international mechanisms in protecting human rights.' },
  { id: 'ls8', subjectCode: 'LEGL', topic: 'Contemporary Issue', dotPoint: "Analyse a contemporary legal issue, applying relevant legal principles and evaluating the law's response." },
  { id: 'ls9', subjectCode: 'LEGL', topic: 'Options Module', dotPoint: 'Examine the law relating to the chosen options topic (Family, Indigenous Peoples, Shelter, Consumers or Global Environment).' },

  // MODERN HISTORY (HIST_MOD)
  { id: 'mh1', subjectCode: 'HIST_MOD', topic: 'Historical Concepts & Skills', dotPoint: 'Apply historical concepts including continuity, change, cause, effect, significance and perspective to historical inquiry.' },
  { id: 'mh2', subjectCode: 'HIST_MOD', topic: 'Historical Concepts & Skills', dotPoint: 'Evaluate the reliability, relevance and purpose of primary and secondary sources.' },
  { id: 'mh3', subjectCode: 'HIST_MOD', topic: 'Peace & Conflict (WWI)', dotPoint: 'Analyse the causes of World War I and assess the significance of individual decisions and structural forces.' },
  { id: 'mh4', subjectCode: 'HIST_MOD', topic: 'Peace & Conflict (WWI)', dotPoint: 'Evaluate the nature of trench warfare and the experience of soldiers on the Western Front.' },
  { id: 'mh5', subjectCode: 'HIST_MOD', topic: 'National Study', dotPoint: 'Examine the political, economic and social developments of the chosen national study.' },
  { id: 'mh6', subjectCode: 'HIST_MOD', topic: 'National Study', dotPoint: 'Assess the significance of key individuals and ideologies in shaping the history of the chosen nation.' },
  { id: 'mh7', subjectCode: 'HIST_MOD', topic: 'International Study — WWII', dotPoint: 'Analyse the causes and consequences of World War II, including the Holocaust and atomic bombings.' },
  { id: 'mh8', subjectCode: 'HIST_MOD', topic: 'International Study — WWII', dotPoint: 'Evaluate the role of propaganda, ideology and technology in shaping World War II.' },
  { id: 'mh9', subjectCode: 'HIST_MOD', topic: 'Change in the Modern World', dotPoint: 'Examine a significant change in the modern world including its causes, nature and consequences.' },

  // ANCIENT HISTORY (HIST_ANC)
  { id: 'ah1', subjectCode: 'HIST_ANC', topic: 'Historical Concepts & Skills', dotPoint: 'Evaluate the value and limitations of primary sources (archaeological and written) in reconstructing the ancient world.' },
  { id: 'ah2', subjectCode: 'HIST_ANC', topic: 'Historical Concepts & Skills', dotPoint: 'Explain the role of historiography and the way interpretations of the ancient world change over time.' },
  { id: 'ah3', subjectCode: 'HIST_ANC', topic: 'Personalities in their Times', dotPoint: 'Assess the impact of key personalities on the political, military and cultural development of their society.' },
  { id: 'ah4', subjectCode: 'HIST_ANC', topic: 'Personalities in their Times', dotPoint: 'Evaluate contemporary and later views of key ancient personalities and account for interpretive differences.' },
  { id: 'ah5', subjectCode: 'HIST_ANC', topic: 'Cities of Vesuvius', dotPoint: 'Describe social, economic and political life of Pompeii and Herculaneum from archaeological evidence.' },
  { id: 'ah6', subjectCode: 'HIST_ANC', topic: 'Cities of Vesuvius', dotPoint: 'Assess the contributions of excavations at Pompeii and Herculaneum to understanding Roman society.' },
  { id: 'ah7', subjectCode: 'HIST_ANC', topic: 'Ancient Societies', dotPoint: 'Examine the political, economic and social structures of the chosen ancient society.' },
  { id: 'ah8', subjectCode: 'HIST_ANC', topic: 'Ancient Societies', dotPoint: 'Analyse the role of religion, culture and ideology in shaping the chosen ancient society.' },

  // SOFTWARE ENGINEERING (SOFT_ENG)
  { id: 'se1', subjectCode: 'SOFT_ENG', topic: 'Software Development Lifecycle', dotPoint: 'Describe stages of the software development process: requirements, design, implementation, testing and maintenance.' },
  { id: 'se2', subjectCode: 'SOFT_ENG', topic: 'Software Development Lifecycle', dotPoint: 'Compare structured, object-oriented and agile methodologies and evaluate their contexts of use.' },
  { id: 'se3', subjectCode: 'SOFT_ENG', topic: 'Programming Fundamentals', dotPoint: 'Design and implement algorithms using sequence, selection and iteration constructs.' },
  { id: 'se4', subjectCode: 'SOFT_ENG', topic: 'Programming Fundamentals', dotPoint: 'Apply OOP principles: encapsulation, inheritance, polymorphism and abstraction.' },
  { id: 'se5', subjectCode: 'SOFT_ENG', topic: 'Data Structures', dotPoint: 'Implement and evaluate arrays, stacks, queues, linked lists and trees.' },
  { id: 'se6', subjectCode: 'SOFT_ENG', topic: 'Data Structures', dotPoint: 'Analyse the time and space complexity of common algorithms using Big-O notation.' },
  { id: 'se7', subjectCode: 'SOFT_ENG', topic: 'Software Development Tools', dotPoint: 'Use IDEs, version control systems, debugging tools and testing frameworks effectively.' },
  { id: 'se8', subjectCode: 'SOFT_ENG', topic: 'Project Work', dotPoint: 'Plan, develop and evaluate a software project addressing a real-world need, with full documentation.' },

  // ENGINEERING STUDIES (ENG_STUD)
  { id: 'engs1', subjectCode: 'ENG_STUD', topic: 'Engineering Fundamentals', dotPoint: 'Apply mechanical principles including forces, torque, moments and equilibrium to engineering structures.' },
  { id: 'engs2', subjectCode: 'ENG_STUD', topic: 'Engineering Fundamentals', dotPoint: "Explain material properties including stress, strain and Young's modulus applied to engineering design." },
  { id: 'engs3', subjectCode: 'ENG_STUD', topic: 'Hydraulics and Pneumatics', dotPoint: 'Describe principles of hydraulic and pneumatic systems and analyse their engineering applications.' },
  { id: 'engs4', subjectCode: 'ENG_STUD', topic: 'Engineering Drawing', dotPoint: 'Produce and interpret engineering drawings using standard orthographic and isometric projection.' },
  { id: 'engs5', subjectCode: 'ENG_STUD', topic: 'Electrical Engineering', dotPoint: "Apply Ohm's law, Kirchhoff's laws and electrical circuit analysis to engineering problems." },
  { id: 'engs6', subjectCode: 'ENG_STUD', topic: 'Focus Module', dotPoint: 'Evaluate engineering principles, historical development and societal impact of the chosen focus module.' },
  { id: 'engs7', subjectCode: 'ENG_STUD', topic: 'Engineering Project', dotPoint: 'Plan, construct and evaluate an engineering project, applying appropriate design and testing strategies.' },

  // INFORMATION PROCESSES AND TECHNOLOGY (IPT)
  { id: 'ipt1', subjectCode: 'IPT', topic: 'Information Systems', dotPoint: 'Identify and describe the components of an information system: people, data, processes, hardware and software.' },
  { id: 'ipt2', subjectCode: 'IPT', topic: 'Information Systems', dotPoint: 'Analyse information flow within an organisation using data flow diagrams and systems analysis techniques.' },
  { id: 'ipt3', subjectCode: 'IPT', topic: 'Databases', dotPoint: 'Design relational databases using entity-relationship diagrams, normalisation (1NF, 2NF, 3NF) and SQL queries.' },
  { id: 'ipt4', subjectCode: 'IPT', topic: 'Databases', dotPoint: 'Evaluate the advantages of database management systems over file-based systems for data integrity and security.' },
  { id: 'ipt5', subjectCode: 'IPT', topic: 'Communications Systems', dotPoint: 'Explain data communications concepts including protocols, transmission media, network topologies and the OSI model.' },
  { id: 'ipt6', subjectCode: 'IPT', topic: 'Communications Systems', dotPoint: 'Analyse issues of privacy, security and intellectual property in relation to information systems.' },
  { id: 'ipt7', subjectCode: 'IPT', topic: 'Transaction Processing', dotPoint: 'Describe characteristics of transaction processing systems and their application in real-time environments.' },
  { id: 'ipt8', subjectCode: 'IPT', topic: 'Project Work', dotPoint: 'Plan, develop and evaluate an information system project meeting a defined user need.' },

  // PDHPE
  { id: 'pd1', subjectCode: 'PDHPE', topic: 'Health Priorities in Australia', dotPoint: 'Justify why some groups experience a greater burden of ill health and explain the social determinants of health.' },
  { id: 'pd2', subjectCode: 'PDHPE', topic: 'Health Priorities in Australia', dotPoint: 'Evaluate the effectiveness of health promotion strategies including the Ottawa Charter and National Health Priority Areas.' },
  { id: 'pd3', subjectCode: 'PDHPE', topic: 'The Body in Motion', dotPoint: 'Analyse the structure and function of the musculoskeletal, cardiovascular and respiratory systems during physical activity.' },
  { id: 'pd4', subjectCode: 'PDHPE', topic: 'The Body in Motion', dotPoint: 'Explain the acute and chronic adaptations to exercise training across body systems.' },
  { id: 'pd5', subjectCode: 'PDHPE', topic: 'Sport & Physical Activity in Australia', dotPoint: 'Analyse the relationship between sport, physical activity, culture and identity in Australian society.' },
  { id: 'pd6', subjectCode: 'PDHPE', topic: 'Sport & Physical Activity in Australia', dotPoint: 'Evaluate the effectiveness of strategies to increase participation in physical activity across diverse groups.' },
  { id: 'pd7', subjectCode: 'PDHPE', topic: 'Performance', dotPoint: 'Evaluate the use of scientific, psychological and sociocultural approaches to improving performance.' },
  { id: 'pd8', subjectCode: 'PDHPE', topic: 'Performance', dotPoint: 'Assess the ethical issues associated with performance-enhancing technologies and substances in sport.' },

  // STUDIES OF RELIGION (SOR)
  { id: 'sor1', subjectCode: 'SOR', topic: 'Nature of Religion & Belief', dotPoint: 'Describe the characteristics of religion and explain what distinguishes religious from non-religious worldviews.' },
  { id: 'sor2', subjectCode: 'SOR', topic: 'Nature of Religion & Belief', dotPoint: 'Explain the concept of the Dreaming and its significance as the foundation of Aboriginal spirituality.' },
  { id: 'sor3', subjectCode: 'SOR', topic: 'Christianity', dotPoint: 'Outline the principal beliefs of Christianity including the nature of God and the significance of Jesus Christ.' },
  { id: 'sor4', subjectCode: 'SOR', topic: 'Christianity', dotPoint: 'Describe the practices of worship, prayer and the sacraments in Christian tradition.' },
  { id: 'sor5', subjectCode: 'SOR', topic: 'Islam', dotPoint: 'Outline the Five Pillars of Islam and explain their significance to Muslim adherents.' },
  { id: 'sor6', subjectCode: 'SOR', topic: 'Islam', dotPoint: 'Explain the beliefs of Islam about God (Tawhid), prophethood and the afterlife.' },
  { id: 'sor7', subjectCode: 'SOR', topic: 'Judaism', dotPoint: 'Describe the principal beliefs of Judaism including the covenant relationship, Torah and ethical monotheism.' },
  { id: 'sor8', subjectCode: 'SOR', topic: 'Judaism', dotPoint: 'Explain the significance of Shabbat, Jewish festivals and the synagogue in maintaining Jewish identity.' },
  { id: 'sor9', subjectCode: 'SOR', topic: 'Buddhism', dotPoint: 'Outline the Four Noble Truths and the Eightfold Path as the foundation of Buddhist teaching.' },
  { id: 'sor10', subjectCode: 'SOR', topic: 'Buddhism', dotPoint: 'Explain the significance of the Three Jewels (Buddha, Dhamma, Sangha) in Buddhist practice.' },
  { id: 'sor11', subjectCode: 'SOR', topic: 'Hinduism', dotPoint: 'Describe the key beliefs of Hinduism including dharma, karma, samsara and moksha.' },
  { id: 'sor12', subjectCode: 'SOR', topic: 'Hinduism', dotPoint: 'Explain the significance of puja, pilgrimage and sacred texts in Hindu religious practice.' },
  { id: 'sor13', subjectCode: 'SOR', topic: 'Religion & Non-Religion', dotPoint: 'Analyse the relationship between religion and science, including complementary and conflicting perspectives.' },
  { id: 'sor14', subjectCode: 'SOR', topic: 'Religion & Non-Religion', dotPoint: 'Evaluate the ways in which religion and non-religious worldviews respond to common human questions about meaning and ethics.' },
];

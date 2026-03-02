// Canonical display names for all topic IDs.
// Used wherever a topic_id needs to be shown to the user.
const TOPIC_DISPLAY_NAMES = {
  sequences_series:                  'Sequences & Series',
  exponents_logarithms:              'Exponents & Logarithms',
  binomial_theorem:                  'Binomial Theorem',
  proofs:                            'Proofs',
  complex_numbers:                   'Complex Numbers',
  systems_of_equations:              'Systems of Equations',
  functions_basics:                  'Functions: Basics',
  quadratics:                        'Quadratics',
  rational_exponential_log_functions:'Rational, Exponential & Logarithmic Functions',
  transformations:                   'Transformations',
  functions_ahl:                     'Functions (AHL)',
  measurement_and_trig:              'Measurement & Trigonometry',
  unit_circle_identities:            'Unit Circle & Identities',
  circular_functions:                'Circular Functions',
  vectors:                           'Vectors',
  trig_identities_ahl:               'Trigonometry Identities (AHL)',
  vector_applications:               'Vector Applications',
  descriptive_stats:                 'Descriptive Statistics',
  probability:                       'Probability',
  distributions:                     'Distributions',
  stats_ahl:                         'Statistics (AHL)',
  limits_and_derivatives:            'Limits & Derivatives',
  differentiation_applications:      'Differentiation Applications',
  integration_basics:                'Integration Basics',
  calculus_applications:             'Calculus Applications',
  calculus_ahl_differentiation:      'Calculus AHL: Differentiation',
  calculus_ahl_integration:          'Calculus AHL: Integration',
  differential_equations:            'Differential Equations',
};

// Abbreviation expansions for any words not covered by the lookup above.
const WORD_EXPANSIONS = {
  trig:        'Trigonometry',
  calc:        'Calculus',
  stats:       'Statistics',
  ahl:         '(AHL)',
  exp:         'Exponential',
  log:         'Logarithmic',
  diff:        'Differentiation',
  int:         'Integration',
  eq:          'Equation',
  eqs:         'Equations',
  prob:        'Probability',
  geo:         'Geometry',
  alg:         'Algebra',
};

/**
 * Returns the proper display name for a topic ID.
 * Falls back to expanding known abbreviations, then title-casing.
 */
export function formatTopicName(topicId) {
  if (!topicId) return '';
  if (TOPIC_DISPLAY_NAMES[topicId]) return TOPIC_DISPLAY_NAMES[topicId];

  // Fallback: split on underscores, expand abbreviations, title-case
  return topicId
    .split('_')
    .map((w) => {
      const lower = w.toLowerCase();
      if (WORD_EXPANSIONS[lower]) return WORD_EXPANSIONS[lower];
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Discriminator for the two reminder features (PRD § Data model).
 *
 * Shared by the data, scheduling, and navigation layers so the Repository
 * doesn't need to import from a navigation module.
 */
export type Feature = 'eye' | 'water';

export type GenderType = 'male' | 'female' | 'other';
export type DisciplineType = 'karate_shotokan' | 'judo_kodokan' | 'self_defense';
export type StudentStatus = 'draft' | 'pending' | 'approved' | 'rejected';
/** Use for inserts/updates to avoid invalid status values. */
export const STUDENT_STATUS: Record<StudentStatus, StudentStatus> = {
  draft: 'draft',
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export const DISCIPLINE_OPTIONS: { value: DisciplineType; label: string }[] = [
  { value: 'karate_shotokan', label: 'Karate (Shotokan)' },
  { value: 'judo_kodokan', label: 'Judo (Kodokan)' },
  { value: 'self_defense', label: 'Self Defense' },
];

export const TRAINING_CENTERS = [
  { slug: 'downtown_headquarters', name: 'Downtown Headquarters' },
  { slug: 'northside_satellite', name: 'Northside Satellite' },
  { slug: 'westbay_academy', name: 'Westbay Academy' },
] as const;

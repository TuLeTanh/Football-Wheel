import clubsRaw from './clubs.json';
import nationalTeamsRaw from './nationalTeams.json';
import legendClubsRaw from './legendClubs.json';
import type { CategoryId, CategoryMeta, Team } from '@/types';

// To add a new category (e.g. J-League), drop a new JSON file here and
// register it below — no other code needs to change.
function tag(list: Omit<Team, 'category'>[], category: CategoryId): Team[] {
  return list.map((t) => ({ ...t, category }));
}

export const TEAMS_BY_CATEGORY: Record<CategoryId, Team[]> = {
  club: tag(clubsRaw, 'club'),
  national: tag(nationalTeamsRaw, 'national'),
  legend: tag(legendClubsRaw, 'legend')
};

export const CATEGORIES: CategoryMeta[] = [
  { id: 'club', labelKey: 'category.club', accent: 'club' },
  { id: 'national', labelKey: 'category.national', accent: 'national' },
  { id: 'legend', labelKey: 'category.legend', accent: 'legend' }
];

export function getAllTeams(category: CategoryId): Team[] {
  return TEAMS_BY_CATEGORY[category] ?? [];
}

export function findTeam(category: CategoryId, teamId: string): Team | undefined {
  return getAllTeams(category).find((t) => t.id === teamId);
}

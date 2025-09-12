/**
 * Companion Utility Functions
 * Centralized utilities for companion ID and name handling
 */

/**
 * Maps companion IDs to their display names
 */
const COMPANION_DISPLAY_NAMES: Record<string, string> = {
  'finn': 'Finn',
  'sage': 'Sage',
  'spark': 'Spark',
  'harmony': 'Harmony',
  'finn-expert': 'Finn',
  'sage-expert': 'Sage',
  'spark-expert': 'Spark',
  'harmony-expert': 'Harmony'
};

/**
 * Gets the proper display name for a companion ID
 * @param companionId - The lowercase companion ID (e.g., 'finn')
 * @returns The properly capitalized display name (e.g., 'Finn')
 */
export function getCompanionDisplayName(companionId: string | undefined | null): string {
  if (!companionId) return 'Finn'; // Default companion
  
  // Ensure lowercase for lookup
  const id = companionId.toLowerCase();
  
  // Return mapped name or capitalize first letter as fallback
  return COMPANION_DISPLAY_NAMES[id] || 
    companionId.charAt(0).toUpperCase() + companionId.slice(1).toLowerCase();
}

/**
 * Ensures a companion ID is in the correct lowercase format
 * @param companionId - The companion ID in any case
 * @returns The lowercase companion ID
 */
export function normalizeCompanionId(companionId: string | undefined | null): string {
  if (!companionId) return 'finn'; // Default companion
  return companionId.toLowerCase();
}

/**
 * Gets companion info from either an ID or name
 * @param companion - Can be ID or display name
 * @returns Object with both id and displayName
 */
export function getCompanionInfo(companion: string | undefined | null): { id: string; displayName: string } {
  const id = normalizeCompanionId(companion);
  const displayName = getCompanionDisplayName(id);
  
  return { id, displayName };
}

/**
 * List of valid companion IDs
 */
export const VALID_COMPANION_IDS = ['finn', 'sage', 'spark', 'harmony'];

/**
 * Checks if a companion ID is valid
 */
export function isValidCompanionId(companionId: string | undefined | null): boolean {
  if (!companionId) return false;
  return VALID_COMPANION_IDS.includes(companionId.toLowerCase());
}
/**
 * Convert a human-readable string to snake_case slug.
 *
 * @example toSnakeCase('Points Unit Value') => 'points_unit_value'
 * @example toSnakeCase('WA Notification Enabled') => 'wa_notification_enabled'
 */
export function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

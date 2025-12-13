/**
 * Utility functions for dynamic year calculations
 * Used throughout the app to ensure years are always current
 */

/**
 * Get the year from an event date string (YYYY-MM-DD format)
 */
export const getYearFromEventDate = (eventDate: string): number => {
  return new Date(eventDate).getFullYear();
};

/**
 * Get the current tour year based on event data
 * Returns the year of the first upcoming event, or current year if no events
 */
export const getTourYear = (events: { event_date?: string; eventDate?: string }[] = []): number => {
  if (events.length === 0) return new Date().getFullYear();
  
  // Get the first event's year (events should already be sorted)
  const firstEventDate = events[0].event_date || events[0].eventDate;
  if (!firstEventDate) return new Date().getFullYear();
  
  return getYearFromEventDate(firstEventDate);
};

/**
 * Get a year range string for tour display (e.g., "2026" or "2026/27")
 * Based on the actual years of events in the dataset
 */
export const getTourYearRange = (events: { event_date?: string; eventDate?: string }[] = []): string => {
  if (events.length === 0) {
    const currentYear = new Date().getFullYear();
    return String(currentYear);
  }
  
  // Get unique years from all events
  const years = new Set<number>();
  events.forEach(event => {
    const eventDate = event.event_date || event.eventDate;
    if (eventDate) {
      years.add(getYearFromEventDate(eventDate));
    }
  });
  
  const sortedYears = Array.from(years).sort((a, b) => a - b);
  
  if (sortedYears.length === 0) {
    return String(new Date().getFullYear());
  }
  
  if (sortedYears.length === 1) {
    return String(sortedYears[0]);
  }
  
  // Return range like "2026" if all events are in same year, 
  // or first year if spanning multiple years
  return String(sortedYears[0]);
};

/**
 * Get the SEO year string for page titles
 * Returns the year of the majority of upcoming events
 */
export const getSEOTourYear = (events: { event_date?: string; eventDate?: string }[] = []): string => {
  if (events.length === 0) {
    return String(new Date().getFullYear());
  }
  
  // Count events per year
  const yearCounts: Record<number, number> = {};
  events.forEach(event => {
    const eventDate = event.event_date || event.eventDate;
    if (eventDate) {
      const year = getYearFromEventDate(eventDate);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  
  // Find year with most events
  const sortedYears = Object.entries(yearCounts)
    .sort(([, a], [, b]) => b - a);
  
  if (sortedYears.length === 0) {
    return String(new Date().getFullYear());
  }
  
  return sortedYears[0][0];
};

/**
 * Capitalizes the first letter of each word in a string
 * Used for name, surname, city, street inputs
 */
export function capitalizeFirstLetter(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Capitalizes first letter of each word (for full names, addresses)
 */
export function capitalizeWords(value: string): string {
  if (!value) return value;
  return value
    .split(' ')
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Normalizes input value based on field type
 */
export function normalizeInputValue(value: string, fieldName: string): string {
  const normalizedName = fieldName.toLowerCase();

  // Don't capitalize email and password fields
  if (
    normalizedName.includes('email') ||
    normalizedName.includes('password') ||
    normalizedName.includes('username')
  ) {
    return value.trim();
  }

  // Capitalize name-like fields
  if (
    normalizedName.includes('name') ||
    normalizedName.includes('nome') ||
    normalizedName.includes('cognome') ||
    normalizedName.includes('surname') ||
    normalizedName.includes('firstname') ||
    normalizedName.includes('lastname')
  ) {
    return capitalizeFirstLetter(value.trim());
  }

  // Capitalize address fields
  if (
    normalizedName.includes('city') ||
    normalizedName.includes('città') ||
    normalizedName.includes('citta') ||
    normalizedName.includes('street') ||
    normalizedName.includes('via') ||
    normalizedName.includes('address') ||
    normalizedName.includes('indirizzo')
  ) {
    return capitalizeWords(value.trim());
  }

  // For other fields, just trim
  return value.trim();
}

/**
 * Checks if the input event indicates CapsLock is on
 */
export function isCapsLockOn(event: KeyboardEvent): boolean {
  return event.getModifierState && event.getModifierState('CapsLock');
}

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
  const lowerCaseWords = new Set([
    'a',
    'ad',
    'al',
    'alla',
    'alle',
    'allo',
    'agli',
    'ai',
    'da',
    'dal',
    'dalla',
    'dalle',
    'dallo',
    'dagli',
    'dei',
    'degli',
    'del',
    'della',
    'dello',
    'd',
    "d'",
    'de',
    'di',
    'e',
    'ed',
    'il',
    'lo',
    'la',
    'i',
    'gli',
    'le',
    'in',
    'su',
  ]);

  const capitalizeSegment = (segmentRaw: string, isFirstWord: boolean) => {
    const segment = segmentRaw.trim();
    if (!segment) return segmentRaw;
    // Keep segments with digits as-is (e.g. "Viale 2 Giugno").
    if (/\d/.test(segment)) return segmentRaw;

    const normalized = segment.toLowerCase();

    // Handle d'angelo / d’angelo → d'Angelo (unless first word then D'Angelo).
    const apostropheMatch = normalized.match(/^(d)(['’])(.+)$/);
    if (apostropheMatch) {
      const d = apostropheMatch[1];
      const ap = apostropheMatch[2];
      const rest = apostropheMatch[3];
      const head = isFirstWord ? d.toUpperCase() : d;
      const restCased = rest.charAt(0).toUpperCase() + rest.slice(1);
      return `${head}${ap}${restCased}`;
    }

    if (!isFirstWord && lowerCaseWords.has(normalized)) return normalized;
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const words = value.trim().split(/\s+/);
  return words
    .map((word, wordIndex) => {
      const isFirstWord = wordIndex === 0;
      // Preserve hyphenated chunks: santa-maria → Santa-Maria
      const parts = word.split('-');
      if (parts.length <= 1) return capitalizeSegment(word, isFirstWord);
      return parts.map((p, i) => capitalizeSegment(p, isFirstWord && i === 0)).join('-');
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

/**
 * Locale resolution for FileTopo.
 *
 * Rules, in order:
 *   1. An explicit choice made by the user always wins, and survives restarts.
 *   2. Otherwise the system or browser language decides: any `fr` locale gets
 *      French, every other locale gets English.
 *   3. English is the fallback whenever nothing can be determined.
 *
 * No network, no dependency, no telemetry: this reads a language tag and a
 * single `localStorage` key, nothing else.
 */

export type Locale = "fr" | "en";

/** Used when the system language is unknown or unsupported. */
export const DEFAULT_LOCALE: Locale = "en";

/** The only key FileTopo writes to `localStorage`. */
export const LOCALE_STORAGE_KEY = "filetopo.locale";

const SUPPORTED_LOCALES: readonly Locale[] = ["fr", "en"];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Extracts the primary subtag of a BCP 47 language tag.
 *
 * `fr-CA` and `fr_CA` yield `fr`; `en-FR` yields `en`, because the region says
 * nothing about the language the interface should use.
 */
function primarySubtag(tag: string): string {
  return tag.trim().toLowerCase().split(/[-_]/)[0] ?? "";
}

/**
 * Maps a list of language tags, most preferred first, to a supported locale.
 * Returns {@link DEFAULT_LOCALE} when the list is empty, absent or unsupported.
 */
export function detectLocale(languages?: readonly string[] | null): Locale {
  if (!languages) return DEFAULT_LOCALE;
  for (const tag of languages) {
    if (typeof tag !== "string") continue;
    const primary = primarySubtag(tag);
    if (!primary) continue;
    return primary === "fr" ? "fr" : DEFAULT_LOCALE;
  }
  return DEFAULT_LOCALE;
}

/**
 * Reads the language tags advertised by the host, most preferred first.
 * `navigator.languages` is preferred; `navigator.language` is the fallback.
 */
export function hostLanguages(nav?: Pick<Navigator, "language" | "languages"> | null): readonly string[] {
  const source = nav === undefined ? (typeof navigator === "undefined" ? null : navigator) : nav;
  if (!source) return [];
  const list = source.languages;
  if (Array.isArray(list) && list.length > 0) return list;
  return typeof source.language === "string" && source.language ? [source.language] : [];
}

function safeStorage(storage?: Storage | null): Storage | null {
  if (storage !== undefined) return storage;
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Storage can be blocked entirely; that is not an error worth surfacing.
    return null;
  }
}

/** Returns the explicitly chosen locale, or `null` if none was ever stored. */
export function readStoredLocale(storage?: Storage | null): Locale | null {
  const target = safeStorage(storage);
  if (!target) return null;
  try {
    const value = target.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/** Persists an explicit choice. Returns `false` when storage refused it. */
export function storeLocale(locale: Locale, storage?: Storage | null): boolean {
  const target = safeStorage(storage);
  if (!target) return false;
  try {
    target.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}

/**
 * The locale the interface should start with: a remembered explicit choice if
 * there is one, otherwise the host language, otherwise English.
 */
export function resolveInitialLocale(options?: {
  storage?: Storage | null;
  languages?: readonly string[] | null;
}): Locale {
  const stored = readStoredLocale(options?.storage);
  if (stored) return stored;
  const languages = options && "languages" in options ? options.languages : hostLanguages();
  return detectLocale(languages);
}

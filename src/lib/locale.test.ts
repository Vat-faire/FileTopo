import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectLocale,
  hostLanguages,
  isLocale,
  readStoredLocale,
  resolveInitialLocale,
  storeLocale,
} from "./locale";

/** Minimal in-memory `Storage`, so the tests never touch a real profile. */
function memoryStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  } as Storage;
}

/** A `Storage` that refuses every operation, like a locked-down browser. */
function hostileStorage(): Storage {
  const refuse = () => {
    throw new Error("storage disabled");
  };
  return {
    get length(): number {
      return refuse();
    },
    clear: refuse,
    getItem: refuse,
    key: refuse,
    removeItem: refuse,
    setItem: refuse,
  } as unknown as Storage;
}

describe("English is the fallback", () => {
  it("declares English as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("falls back to English when no language tag is available", () => {
    expect(detectLocale([])).toBe("en");
    expect(detectLocale(null)).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
  });
});

describe("detectLocale", () => {
  it("returns French for every fr locale, whatever the region or case", () => {
    for (const tag of ["fr", "fr-CA", "fr-FR", "fr-BE", "fr-CH", "FR-ca", "fr_CA", "  fr-CA  "]) {
      expect(detectLocale([tag])).toBe("fr");
    }
  });

  it("returns English for every non-fr locale", () => {
    for (const tag of ["en", "en-US", "en-CA", "es-ES", "de-DE", "pt-BR", "ja", "zh-Hans", "ar"]) {
      expect(detectLocale([tag])).toBe("en");
    }
  });

  it("matches the primary subtag only, so en-FR stays English", () => {
    expect(detectLocale(["en-FR"])).toBe("en");
    expect(detectLocale(["de-FR"])).toBe("en");
  });

  it("does not mistake another language whose tag merely contains fr", () => {
    // `af` (Afrikaans) and `fy` (Frisian) must not be read as French.
    expect(detectLocale(["af-ZA"])).toBe("en");
    expect(detectLocale(["fy-NL"])).toBe("en");
    expect(detectLocale(["frr"])).toBe("en");
  });

  it("honours preference order and uses the first valid language tag", () => {
    expect(detectLocale(["en-US", "fr-CA"])).toBe("en");
    expect(detectLocale(["de-DE", "fr"])).toBe("en");
    expect(detectLocale(["fr-CA", "en-US"])).toBe("fr");
    expect(detectLocale(["", "fr-CA", "en-US"])).toBe("fr");
    expect(detectLocale(["en-US", "es-ES"])).toBe("en");
  });

  it("ignores malformed entries instead of throwing", () => {
    expect(detectLocale(["", "  ", "fr-CA"])).toBe("fr");
    expect(detectLocale([null as unknown as string, 42 as unknown as string])).toBe("en");
  });
});

describe("hostLanguages", () => {
  it("prefers navigator.languages over navigator.language", () => {
    const nav = { language: "en-US", languages: ["fr-CA", "en-US"] };
    expect(hostLanguages(nav)).toEqual(["fr-CA", "en-US"]);
    expect(detectLocale(hostLanguages(nav))).toBe("fr");
  });

  it("falls back to navigator.language when the list is empty", () => {
    expect(hostLanguages({ language: "fr-FR", languages: [] })).toEqual(["fr-FR"]);
  });

  it("returns an empty list when the host exposes nothing", () => {
    expect(hostLanguages(null)).toEqual([]);
    expect(hostLanguages({ language: "", languages: [] })).toEqual([]);
  });
});

describe("isLocale", () => {
  it("accepts supported locales and rejects everything else", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    for (const value of ["de", "fr-CA", "", null, undefined, 7, {}]) {
      expect(isLocale(value)).toBe(false);
    }
  });
});

describe("persistence of an explicit choice", () => {
  it("writes the chosen locale under a single namespaced key", () => {
    const storage = memoryStorage();
    expect(storeLocale("fr", storage)).toBe(true);
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe("fr");
    expect(storage.length).toBe(1);
  });

  it("reads back a stored choice", () => {
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: "fr" }))).toBe("fr");
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: "en" }))).toBe("en");
  });

  it("returns null when nothing was ever stored", () => {
    expect(readStoredLocale(memoryStorage())).toBeNull();
  });

  it("ignores a corrupted stored value instead of trusting it", () => {
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: "klingon" }))).toBeNull();
    expect(readStoredLocale(memoryStorage({ [LOCALE_STORAGE_KEY]: "" }))).toBeNull();
  });

  it("survives a storage that throws, without crashing the interface", () => {
    expect(readStoredLocale(hostileStorage())).toBeNull();
    expect(storeLocale("fr", hostileStorage())).toBe(false);
    expect(readStoredLocale(null)).toBeNull();
    expect(storeLocale("fr", null)).toBe(false);
  });

  it("keeps the last explicit choice when it is changed twice", () => {
    const storage = memoryStorage();
    storeLocale("fr", storage);
    storeLocale("en", storage);
    expect(readStoredLocale(storage)).toBe("en");
  });
});

describe("resolveInitialLocale", () => {
  it("uses the system language when no choice was ever made", () => {
    expect(resolveInitialLocale({ storage: memoryStorage(), languages: ["fr-CA"] })).toBe("fr");
    expect(resolveInitialLocale({ storage: memoryStorage(), languages: ["de-DE"] })).toBe("en");
  });

  it("lets an explicit French choice win over an English system", () => {
    const storage = memoryStorage({ [LOCALE_STORAGE_KEY]: "fr" });
    expect(resolveInitialLocale({ storage, languages: ["en-US"] })).toBe("fr");
  });

  it("lets an explicit English choice win over a French system", () => {
    const storage = memoryStorage({ [LOCALE_STORAGE_KEY]: "en" });
    expect(resolveInitialLocale({ storage, languages: ["fr-CA"] })).toBe("en");
  });

  it("falls back to English when neither storage nor system says anything", () => {
    expect(resolveInitialLocale({ storage: memoryStorage(), languages: [] })).toBe("en");
    expect(resolveInitialLocale({ storage: null, languages: null })).toBe("en");
  });

  it("re-reads storage on each call, so a fresh start honours the last choice", () => {
    const storage = memoryStorage();
    expect(resolveInitialLocale({ storage, languages: ["en-US"] })).toBe("en");
    storeLocale("fr", storage);
    // Simulates the next application start with the same profile.
    expect(resolveInitialLocale({ storage, languages: ["en-US"] })).toBe("fr");
  });
});

describe("integration with the real jsdom globals", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads and writes the ambient localStorage when no storage is passed", () => {
    expect(readStoredLocale()).toBeNull();
    expect(storeLocale("fr")).toBe(true);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("fr");
    expect(readStoredLocale()).toBe("fr");
    expect(resolveInitialLocale()).toBe("fr");
  });
});

import { describe, it, expect } from 'vitest';
import { translations } from './src/i18n/translations';
import { swissCantons } from './src/data/cantons';

describe('Swiss Benefits Landing 2026', () => {
  it('contains complete translations for all 3 languages: DE, FR, IT', () => {
    const languages = ['de', 'fr', 'it'] as const;
    languages.forEach(lang => {
      expect(translations[lang]).toBeDefined();
      expect(translations[lang].hero.mainTitlePrefix).toBeTruthy();
      expect(translations[lang].painPoints.card1.question).toBeTruthy();
      expect(translations[lang].calculator.title).toBeTruthy();
      expect(translations[lang].guide.features.length).toBe(7);
      expect(translations[lang].faq.items.length).toBeGreaterThanOrEqual(6);
    });
  });

  it('contains official data for all major Swiss cantons with specific 2026 deadlines and rates', () => {
    expect(swissCantons.length).toBeGreaterThanOrEqual(18);
    const sg = swissCantons.find(c => c.code === 'SG');
    expect(sg).toBeDefined();
    expect(sg?.pvDeadline).toBe('31.05.2026');

    const bl = swissCantons.find(c => c.code === 'BL');
    expect(bl).toBeDefined();
    expect(bl?.sampleRichtpraemie).toBe(4596);
  });
});

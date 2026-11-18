import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('i18n Dictionary Parity & Localization Test Suite', () => {
  it('translations object contains both "id" and "en" dictionaries', async () => {
    const { translations } = await import('../frontend/src/lib/translations.ts');
    assert.ok(translations.id, 'translations.id must exist');
    assert.ok(translations.en, 'translations.en must exist');
  });

  it('all top-level sections in "id" exist in "en" and vice versa', async () => {
    const { translations } = await import('../frontend/src/lib/translations.ts');

    const idSections = Object.keys(translations.id).sort();
    const enSections = Object.keys(translations.en).sort();

    const missingInEn = idSections.filter((s) => !enSections.includes(s));
    const missingInId = enSections.filter((s) => !idSections.includes(s));

    assert.deepEqual(missingInEn, [], `Sections present in ID but missing in EN: ${missingInEn.join(', ')}`);
    assert.deepEqual(missingInId, [], `Sections present in EN but missing in ID: ${missingInId.join(', ')}`);
  });

  it('every leaf translation key matches recursively between "id" and "en"', async () => {
    const { translations } = await import('../frontend/src/lib/translations.ts');

    function getLeafKeys(obj, prefix = '') {
      let keys = [];
      for (const [key, val] of Object.entries(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          keys = keys.concat(getLeafKeys(val, fullPath));
        } else {
          keys.push(fullPath);
        }
      }
      return keys.sort();
    }

    const idKeys = getLeafKeys(translations.id);
    const enKeys = getLeafKeys(translations.en);

    const missingInEn = idKeys.filter((k) => !enKeys.includes(k));
    const missingInId = enKeys.filter((k) => !idKeys.includes(k));

    assert.deepEqual(
      missingInEn,
      [],
      `The following translation keys are in ID but missing in EN:\n${missingInEn.join('\n')}`
    );
    assert.deepEqual(
      missingInId,
      [],
      `The following translation keys are in EN but missing in ID:\n${missingInId.join('\n')}`
    );
  });
});

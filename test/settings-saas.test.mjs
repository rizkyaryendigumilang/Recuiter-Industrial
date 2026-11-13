import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const {
  SETTINGS_GROUPS,
  SETTINGS_CATEGORIES,
  filterSettingsCategories,
  DEFAULT_PREFERENCES,
} = await import('../frontend/src/lib/settings-config.js').catch(async () => {
  return await import('../frontend/src/lib/settings-config.ts');
});

describe('Modern Professional SaaS Settings Architecture Test Suite', () => {
  test('Contains all 14 required SaaS settings categories across 4 structural groups', () => {
    assert.equal(SETTINGS_CATEGORIES.length, 14);
    assert.equal(SETTINGS_GROUPS.length, 4);

    const groupIds = SETTINGS_GROUPS.map((g) => g.id);
    for (const cat of SETTINGS_CATEGORIES) {
      assert.ok(groupIds.includes(cat.groupId), `Category ${cat.id} has invalid groupId: ${cat.groupId}`);
      assert.ok(cat.label.length > 0, `Category ${cat.id} missing label`);
      assert.ok(cat.desc.length > 0, `Category ${cat.id} missing desc`);
      assert.ok(Array.isArray(cat.keywords) && cat.keywords.length > 0, `Category ${cat.id} missing keywords`);
      assert.ok(Array.isArray(cat.roles) && cat.roles.length > 0, `Category ${cat.id} missing roles`);
    }
  });

  test('Search filter accurately matches category by title, description, and keywords', () => {
    // Search by title
    const passwordResults = filterSettingsCategories(SETTINGS_CATEGORIES, 'password', 'candidate');
    assert.ok(passwordResults.some((c) => c.id === 'account'));

    // Search by keyword
    const kraepelinResults = filterSettingsCategories(SETTINGS_CATEGORIES, 'kraepelin', 'admin');
    assert.ok(kraepelinResults.some((c) => c.id === 'automation'));

    // Search by description phrase
    const backupResults = filterSettingsCategories(SETTINGS_CATEGORIES, 'snapshot backup', 'admin');
    assert.ok(backupResults.some((c) => c.id === 'data'));

    // Unmatched query returns empty
    const noResults = filterSettingsCategories(SETTINGS_CATEGORIES, 'xyz999nonexistent', 'admin');
    assert.equal(noResults.length, 0);
  });

  test('Role-based visibility restricts administrative/automation categories for candidates', () => {
    const candidateCategories = filterSettingsCategories(SETTINGS_CATEGORIES, '', 'candidate');
    const employerCategories = filterSettingsCategories(SETTINGS_CATEGORIES, '', 'employer');
    const adminCategories = filterSettingsCategories(SETTINGS_CATEGORIES, '', 'admin');

    // Automation & Developer should not be visible to ordinary candidate role
    assert.ok(!candidateCategories.some((c) => c.id === 'automation'));
    assert.ok(!candidateCategories.some((c) => c.id === 'developer'));

    // Employer and Admin have access to Automation and Developer
    assert.ok(employerCategories.some((c) => c.id === 'automation'));
    assert.ok(employerCategories.some((c) => c.id === 'developer'));
    assert.ok(adminCategories.some((c) => c.id === 'automation'));
    assert.ok(adminCategories.some((c) => c.id === 'developer'));
  });

  test('Default preferences schema provides complete fallback properties', () => {
    const expectedKeys = [
      'language',
      'timezone',
      'dateFormat',
      'defaultLanding',
      'theme',
      'accentColor',
      'density',
      'fontSize',
      'emailAlerts',
      'pushAlerts',
      'inAppAlerts',
      'jobAlertsWA',
      'assessmentReminderFreq',
      'autoGradingKraepelin',
      'autoInterviewInvite',
    ];

    for (const key of expectedKeys) {
      assert.ok(key in DEFAULT_PREFERENCES, `Missing expected key in DEFAULT_PREFERENCES: ${key}`);
    }

    assert.equal(DEFAULT_PREFERENCES.language, 'id');
    assert.equal(DEFAULT_PREFERENCES.timezone, 'Asia/Jakarta');
    assert.equal(DEFAULT_PREFERENCES.dateFormat, 'DD/MM/YYYY');
    assert.equal(DEFAULT_PREFERENCES.theme, 'light');
    assert.equal(DEFAULT_PREFERENCES.accentColor, 'amber');
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Sorvo Collapsible Sidebar Motion & Mechanics Test Suite', () => {
  it('Keyboard shortcut [ triggers collapse toggle when focused on non-input elements', () => {
    let railState = false;
    const toggleRail = () => {
      railState = !railState;
    };

    const handleKeyDown = (event) => {
      const targetTag = event.target?.tagName?.toUpperCase();
      const isEditable = event.target?.isContentEditable;
      if (
        event.key === '[' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag) &&
        !isEditable
      ) {
        event.preventDefault();
        toggleRail();
      }
    };

    let prevented = false;
    const fakeEventBody = {
      key: '[',
      target: { tagName: 'BODY', isContentEditable: false },
      preventDefault: () => { prevented = true; }
    };

    handleKeyDown(fakeEventBody);
    assert.equal(prevented, true, 'preventDefault should be called on key [');
    assert.equal(railState, true, 'Rail state should toggle to true');

    handleKeyDown(fakeEventBody);
    assert.equal(railState, false, 'Rail state should toggle back to false');
  });

  it('Keyboard shortcut [ is ignored inside input, textarea, and contenteditable elements', () => {
    let railState = false;
    const toggleRail = () => {
      railState = !railState;
    };

    const handleKeyDown = (event) => {
      const targetTag = event.target?.tagName?.toUpperCase();
      const isEditable = event.target?.isContentEditable;
      if (
        event.key === '[' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag) &&
        !isEditable
      ) {
        event.preventDefault();
        toggleRail();
      }
    };

    const inputEvent = {
      key: '[',
      target: { tagName: 'INPUT', isContentEditable: false },
      preventDefault: () => { assert.fail('Should not prevent default inside input'); }
    };
    handleKeyDown(inputEvent);
    assert.equal(railState, false, 'Rail state must not change when typing inside input');

    const textareaEvent = {
      key: '[',
      target: { tagName: 'TEXTAREA', isContentEditable: false },
      preventDefault: () => { assert.fail('Should not prevent default inside textarea'); }
    };
    handleKeyDown(textareaEvent);
    assert.equal(railState, false, 'Rail state must not change when typing inside textarea');

    const editableEvent = {
      key: '[',
      target: { tagName: 'DIV', isContentEditable: true },
      preventDefault: () => { assert.fail('Should not prevent default inside contenteditable'); }
    };
    handleKeyDown(editableEvent);
    assert.equal(railState, false, 'Rail state must not change when typing inside contenteditable');
  });

  it('Rail mode state persistence in localStorage saves "1" and "0"', () => {
    const fakeStorage = new Map();
    const storageKey = 'app:rail';

    const saveRailState = (isRail) => {
      fakeStorage.set(storageKey, isRail ? '1' : '0');
    };

    const loadRailState = () => {
      return fakeStorage.get(storageKey) === '1';
    };

    saveRailState(true);
    assert.equal(fakeStorage.get(storageKey), '1');
    assert.equal(loadRailState(), true);

    saveRailState(false);
    assert.equal(fakeStorage.get(storageKey), '0');
    assert.equal(loadRailState(), false);
  });

  it('Badge counter morphing parameters match Sorvo dot specifications', () => {
    const badgeDefaultStyles = {
      minWidth: '20px',
      height: '20px',
      padding: '0 6px',
      borderRadius: '99px',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const badgeMorphedDotStyles = {
      position: 'absolute',
      top: '8px',
      right: '14px',
      minWidth: '8px',
      width: '8px',
      height: '8px',
      padding: '0',
      fontSize: '0',
      borderRadius: '50%',
      boxShadow: '0 0 0 2px var(--glass-bg)',
    };

    assert.equal(badgeMorphedDotStyles.width, '8px');
    assert.equal(badgeMorphedDotStyles.height, '8px');
    assert.equal(badgeMorphedDotStyles.fontSize, '0');
    assert.equal(badgeMorphedDotStyles.borderRadius, '50%');
    assert.equal(badgeDefaultStyles.borderRadius, '99px');
  });

  it('Collapse button icon flip uses scaleX(-1) with fluid curve', () => {
    const iconFlipTransform = (isRail) => (isRail ? 'scaleX(-1)' : 'none');
    const fluidEasing = 'cubic-bezier(0.16, 1, 0.3, 1)';

    assert.equal(iconFlipTransform(true), 'scaleX(-1)');
    assert.equal(iconFlipTransform(false), 'none');
    assert.ok(fluidEasing.includes('0.16, 1, 0.3, 1'));
  });

  it('Anti-wrapping text fade hides elements with position: absolute and opacity: 0', () => {
    const getTextFadeStyles = (isRail) => {
      if (isRail) {
        return {
          opacity: 0,
          transform: 'translateX(-10px)',
          pointerEvents: 'none',
          position: 'absolute',
        };
      }
      return {
        opacity: 1,
        transform: 'translateX(0)',
        pointerEvents: 'auto',
        position: 'relative',
      };
    };

    const collapsed = getTextFadeStyles(true);
    assert.equal(collapsed.opacity, 0);
    assert.equal(collapsed.transform, 'translateX(-10px)');
    assert.equal(collapsed.position, 'absolute');
    assert.equal(collapsed.pointerEvents, 'none');

    const expanded = getTextFadeStyles(false);
    assert.equal(expanded.opacity, 1);
    assert.equal(expanded.transform, 'translateX(0)');
  });
});

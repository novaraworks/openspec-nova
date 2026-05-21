import { describe, expect, it } from 'vitest';

import {
  getApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
} from '../../../../src/core/templates/workflows/apply-change.nova.js';
import {
  getApplyChangeSkillTemplate as upstreamSkillTemplate,
  getOpsxApplyCommandTemplate as upstreamCommandTemplate,
} from '../../../../src/core/templates/workflows/apply-change.js';

describe('apply-change.nova wrappers', () => {
  it('skill template instructions starts with Step 0', () => {
    const { instructions } = getApplyChangeSkillTemplate();
    expect(instructions).toMatch(/^\*\*Step 0:/);
  });

  it('command template content starts with Step 0', () => {
    const { content } = getOpsxApplyCommandTemplate();
    expect(content).toMatch(/^\*\*Step 0:/);
  });

  it('upstream body is preserved in the wrapper outputs', () => {
    const upstreamSkill = upstreamSkillTemplate();
    const upstreamCommand = upstreamCommandTemplate();

    const { instructions } = getApplyChangeSkillTemplate();
    const { content } = getOpsxApplyCommandTemplate();

    expect(instructions).toContain(upstreamSkill.instructions);
    expect(content).toContain(upstreamCommand.content);
  });
});

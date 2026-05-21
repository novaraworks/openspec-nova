import { describe, expect, it } from 'vitest';

import {
  getArchiveChangeSkillTemplate,
  getOpsxArchiveCommandTemplate,
} from '../../../../src/core/templates/workflows/archive-change.nova.js';
import {
  getArchiveChangeSkillTemplate as upstreamSkillTemplate,
  getOpsxArchiveCommandTemplate as upstreamCommandTemplate,
} from '../../../../src/core/templates/workflows/archive-change.js';

describe('archive-change.nova wrappers', () => {
  it('skill template instructions starts with Step 0', () => {
    const { instructions } = getArchiveChangeSkillTemplate();
    expect(instructions).toMatch(/^\*\*Step 0:/);
  });

  it('command template content starts with Step 0', () => {
    const { content } = getOpsxArchiveCommandTemplate();
    expect(content).toMatch(/^\*\*Step 0:/);
  });

  it('upstream body is preserved in the wrapper outputs', () => {
    const upstreamSkill = upstreamSkillTemplate();
    const upstreamCommand = upstreamCommandTemplate();

    const { instructions } = getArchiveChangeSkillTemplate();
    const { content } = getOpsxArchiveCommandTemplate();

    expect(instructions).toContain(upstreamSkill.instructions);
    expect(content).toContain(upstreamCommand.content);
  });
});

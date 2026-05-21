import { describe, expect, it } from 'vitest';

import {
  getBulkArchiveChangeSkillTemplate,
  getOpsxBulkArchiveCommandTemplate,
} from '../../../../src/core/templates/workflows/bulk-archive-change.nova.js';
import {
  getBulkArchiveChangeSkillTemplate as upstreamSkillTemplate,
  getOpsxBulkArchiveCommandTemplate as upstreamCommandTemplate,
} from '../../../../src/core/templates/workflows/bulk-archive-change.js';

describe('bulk-archive-change.nova wrappers', () => {
  it('skill template instructions starts with Step 0', () => {
    const { instructions } = getBulkArchiveChangeSkillTemplate();
    expect(instructions).toMatch(/^\*\*Step 0:/);
  });

  it('command template content starts with Step 0', () => {
    const { content } = getOpsxBulkArchiveCommandTemplate();
    expect(content).toMatch(/^\*\*Step 0:/);
  });

  it('upstream body is preserved in the wrapper outputs', () => {
    const upstreamSkill = upstreamSkillTemplate();
    const upstreamCommand = upstreamCommandTemplate();

    const { instructions } = getBulkArchiveChangeSkillTemplate();
    const { content } = getOpsxBulkArchiveCommandTemplate();

    expect(instructions).toContain(upstreamSkill.instructions);
    expect(content).toContain(upstreamCommand.content);
  });
});

import type { SkillTemplate, CommandTemplate } from '../types.js';
import {
  getBulkArchiveChangeSkillTemplate as upstreamSkill,
  getOpsxBulkArchiveCommandTemplate as upstreamCommand,
} from './bulk-archive-change.js';
import { STEP_0 } from './_nova-step0.js';

export function getBulkArchiveChangeSkillTemplate(): SkillTemplate {
  const t = upstreamSkill();
  return { ...t, instructions: STEP_0 + '\n\n' + t.instructions };
}

export function getOpsxBulkArchiveCommandTemplate(): CommandTemplate {
  const t = upstreamCommand();
  return { ...t, content: STEP_0 + '\n\n' + t.content };
}

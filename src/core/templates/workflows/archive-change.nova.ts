import type { SkillTemplate, CommandTemplate } from '../types.js';
import {
  getArchiveChangeSkillTemplate as upstreamSkill,
  getOpsxArchiveCommandTemplate as upstreamCommand,
} from './archive-change.js';
import { STEP_0 } from './_nova-step0.js';

export function getArchiveChangeSkillTemplate(): SkillTemplate {
  const t = upstreamSkill();
  return { ...t, instructions: STEP_0 + '\n\n' + t.instructions };
}

export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  const t = upstreamCommand();
  return { ...t, content: STEP_0 + '\n\n' + t.content };
}

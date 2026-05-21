import type { SkillTemplate, CommandTemplate } from '../types.js';
import {
  getApplyChangeSkillTemplate as upstreamSkill,
  getOpsxApplyCommandTemplate as upstreamCommand,
} from './apply-change.js';
import { STEP_0 } from './_nova-step0.js';

export function getApplyChangeSkillTemplate(): SkillTemplate {
  const t = upstreamSkill();
  return { ...t, instructions: STEP_0 + '\n\n' + t.instructions };
}

export function getOpsxApplyCommandTemplate(): CommandTemplate {
  const t = upstreamCommand();
  return { ...t, content: STEP_0 + '\n\n' + t.content };
}

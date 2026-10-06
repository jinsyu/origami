// 난이도(1~10) 순서의 작품 목록
import { cicada } from './cicada.js';
import { airplane } from './airplane.js';

export const MODELS = [cicada, airplane].sort((a, b) => a.level - b.level);

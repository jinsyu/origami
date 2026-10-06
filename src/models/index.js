// 난이도(1~10) 순서의 작품 목록
import { dog } from './dog.js';
import { cup } from './cup.js';
import { cicada } from './cicada.js';
import { airplane } from './airplane.js';
import { swan } from './swan.js';

export const MODELS = [dog, cup, cicada, airplane, swan].sort((a, b) => a.level - b.level);

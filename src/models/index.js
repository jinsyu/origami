// 난이도(1~10) 순서의 작품 목록
import { dog } from './dog.js';
import { cup } from './cup.js';
import { cicada } from './cicada.js';
import { airplane } from './airplane.js';
import { swan } from './swan.js';
import { heart } from './heart.js';
import { tulip } from './tulip.js';
import { crane } from './crane.js';

export const MODELS = [dog, cup, cicada, airplane, swan, heart, tulip, crane].sort((a, b) => a.level - b.level);

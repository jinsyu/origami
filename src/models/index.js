// 난이도(1~10) 순서의 작품 목록
import { dog } from './dog.js';
import { cat } from './cat.js';
import { flower } from './flower.js';
import { cup } from './cup.js';
import { house } from './house.js';
import { penguin } from './penguin.js';
import { cicada } from './cicada.js';
import { kabuto } from './kabuto.js';
import { hat } from './hat.js';
import { airplane } from './airplane.js';
import { envelope } from './envelope.js';
import { swan } from './swan.js';
import { heart } from './heart.js';
import { tulip } from './tulip.js';
import { crane } from './crane.js';
import { masu } from './masu.js';
import { lily } from './lily.js';

export const MODELS = [dog, cat, flower, cup, house, penguin, cicada, kabuto, hat, airplane, envelope, swan, heart, tulip, masu, crane, lily].sort((a, b) => a.level - b.level);

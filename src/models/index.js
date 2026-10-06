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
import { glider } from './glider.js';
import { swan } from './swan.js';
import { owl } from './owl.js';
import { whale } from './whale.js';
import { heart } from './heart.js';
import { frame } from './frame.js';
import { duck } from './duck.js';
import { tulip } from './tulip.js';
import { dino } from './dino.js';
import { crane, bird } from './crane.js';
import { masu } from './masu.js';
import { lily } from './lily.js';

export const MODELS = [dog, cat, flower, cup, house, penguin, cicada, kabuto, hat, airplane, glider, envelope, swan, owl, whale, heart, frame, duck, tulip, dino, masu, bird, crane, lily].sort((a, b) => a.level - b.level);

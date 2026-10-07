// 난이도(1~10) 순서의 작품 목록
import { dog } from './dog.js';
import { cat } from './cat.js';
import { flower } from './flower.js';
import { cup } from './cup.js';
import { bookmark } from './bookmark.js';
import { house } from './house.js';
import { cicada } from './cicada.js';
import { kabuto } from './kabuto.js';
import { hat } from './hat.js';
import { airplane } from './airplane.js';
import { envelope } from './envelope.js';
import { glider } from './glider.js';
import { whale } from './whale.js';
import { heart } from './heart.js';
import { frame } from './frame.js';
import { duck } from './duck.js';
import { tulip } from './tulip.js';
import { heron } from './heron.js';
import { crane } from './crane.js';
import { masu } from './masu.js';
import { roofhouse } from './roofhouse.js';
import { fox } from './fox.js';
import { panda } from './panda.js';
import { boat } from './boat.js';
import { top2 } from './top2.js';

export const MODELS = [dog, cat, flower, cup, bookmark, house, cicada, kabuto, hat, airplane, glider, envelope, whale, heart, frame, duck, tulip, heron, masu, roofhouse, crane, fox, panda, boat, top2].sort((a, b) => a.level - b.level);

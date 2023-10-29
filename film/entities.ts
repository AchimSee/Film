import { Film } from './film.entity.js';
import { Titel } from './titel.entity.js';
import { Schauspieler } from './schauspieler.entity.js';

// erforderlich in src/config/db.ts und src/buch/buch.module.ts
export const entities: [Film, Titel, Schauspieler];
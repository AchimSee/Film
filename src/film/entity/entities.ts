import { type Film } from './film.entity.js';
import { type Schauspieler } from './schauspieler.entity.js';
import { type Titel } from './titel.entity.js';

// erforderlich in src/config/db.ts und src/buch/buch.module.ts
export const entities: [Film, Titel, Schauspieler];

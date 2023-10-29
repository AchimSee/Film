import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Film } from './film.entity.js';

@Entity()
export class Schauspieler {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { length: 32 })
    readonly vorname!: string;

    @Column('varchar', { length: 32 })
    readonly nachname!: string;

    @ManyToOne(() => Film, (film) => film.schauspieler)
    @JoinColumn({ name: 'film_id'})
    film: Film | undefined;

    public toString = (): string => 
        JSON.stringify({
            id: this.id,
            vorname: this.vorname,
            nachname: this.nachname,
        })
}
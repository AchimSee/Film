// eslint-disable @typescript-eslint/no-magic-numbers
/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

/**
 * Entity-Klasse für Schauspieler ohne TypeORM.
 */
export class SchauspielerDTO {
    @MaxLength(32)
    @ApiProperty({ example: 'Der Vorname', type: String })
    readonly vorname!: string;

    @MaxLength(32)
    @ApiProperty({ example: 'Der Nachname', type: String })
    readonly nachname!: string;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

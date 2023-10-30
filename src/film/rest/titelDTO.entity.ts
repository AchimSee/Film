// eslint-disable @typescript-eslint/no-magic-numbers
/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entity-Klasse für Titel ohne TypeORM.
 */
export class TitelDTO {
    @Matches('^\\w.*')
    @MaxLength(40)
    @ApiProperty({ example: 'Der Titel', type: String })
    readonly titel!: string;

    @IsOptional()
    @MaxLength(40)
    @ApiProperty({ example: 'Der Untertitel', type: String })
    readonly untertitel: string | undefined;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

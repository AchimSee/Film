/* eslint-disable max-classes-per-file*/
/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsISO8601,
    IsInt,
    IsOptional,
    IsPositive,
    IsUrl,
    Matches,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { type FilmGenre } from '../entity/film.entity.js';
import { SchauspielerDTO } from './schauspielerDTO.entity.js';
import { TitelDTO } from './titelDTO.entity.js';
import { Type } from 'class-transformer';

/**export const ISAN_REGEX =
    // eslint-disable-next-line security/detect-unsafe-regex
    /^(?:[\da-f]{4}-){4}[\da-z](?:-(?:[\da-f]{4}-){2}[\da-z])?$/u;
*/
export const ISAN_REGEX = /^(?:(?!S).)*$/u;

export const MAX_RATING = 5;

/**
 * Entity-Klasse für Filme ohne TypeORM und ohne Referenzen.
 */
export class FilmDtoOhneRef {
    @Matches(ISAN_REGEX)
    @ApiProperty({ example: '978-0-007-00644-1', type: String })
    readonly isan!: string;

    @IsInt()
    @Min(0)
    @Max(MAX_RATING)
    @ApiProperty({ example: 5, type: Number })
    readonly rating: number | undefined;

    @Matches(/^FANTASY$|^HORROR$|^ACTION$|^SCIENCEFICTION$/u)
    @IsOptional()
    @ApiProperty({ example: 'FANTASY', type: String })
    readonly genre: FilmGenre | undefined;

    @IsPositive()
    @ApiProperty({ example: 1, type: Number })
    // statt number ggf. Decimal aus decimal.js analog zu BigDecimal von Java
    readonly preis!: number;

    @Min(0)
    @Max(1)
    @IsOptional()
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: number | undefined;

    @IsBoolean()
    @ApiProperty({ example: true, type: Boolean })
    readonly lieferbar: boolean | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2021-01-31' })
    readonly datum: Date | string | undefined;

    @IsUrl()
    @IsOptional()
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;

    @IsOptional()
    @ArrayUnique()
    @ApiProperty({ example: ['JAVASCRIPT', 'TYPESCRIPT'] })
    readonly schlagwoerter: string[] | undefined;
}

/**
 * Entity-Klasse für Filme ohne TypeORM.
 */
export class FilmDTO extends FilmDtoOhneRef {
    @ValidateNested()
    @Type(() => TitelDTO)
    @ApiProperty({ type: TitelDTO })
    readonly titel!: TitelDTO; //NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SchauspielerDTO)
    @ApiProperty({ type: [SchauspielerDTO] })
    readonly mehrereschauspieler: SchauspielerDTO[] | undefined;

    // SchauspielerDTO
}
/* eslint-enable max-classes-per-file */

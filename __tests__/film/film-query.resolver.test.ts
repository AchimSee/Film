/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */
/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type Film } from '../../src/film/entity/film.entity.js';
import { type GraphQLFormattedError } from 'graphql';
import { type GraphQLRequest } from '@apollo/server';
import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line jest/no-export
export interface GraphQLResponseBody {
    data?: Record<string, any> | null;
    errors?: readonly [GraphQLFormattedError];
}

type FilmDTO = Omit<
    Film,
    'schauspieler' | 'aktualisiert' | 'erzeugt' | 'rabatt'
> & {
    rabatt: string;
};

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';

const titelVorhanden = 'Alpha';

const teilTitelVorhanden = 'a';

const teilTitelNichtVorhanden = 'abc';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Film zu vorhandener ID', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    film(id: "${idVorhanden}") {
                        version
                        isan
                        genre
                        titel {
                            titel
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { film } = data.data!;
        const result: FilmDTO = film;

        expect(result.titel?.titel).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Film zu nicht-vorhandener ID', async () => {
        // given
        const id = '999999';
        const body: GraphQLRequest = {
            query: `
                {
                    film(id: "${id}") {
                        titel {
                            titel
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.film).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt kein Film mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path!![0]).toBe('film');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Film zu vorhandenem Titel', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    filme(titel: "${titelVorhanden}") {
                        genre
                        titel {
                            titel
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const buecherArray: FilmDTO[] = filme;

        expect(buecherArray).toHaveLength(1);

        const [film] = buecherArray;

        expect(film!.titel?.titel).toBe(titelVorhanden);
    });

    test('Film zu vorhandenem Teil-Titel', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    filme(titel: "${teilTitelVorhanden}") {
                        genre
                        titel {
                            titel
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const buecherArray: FilmDTO[] = filme;
        buecherArray
            .map((film) => film.titel)
            .forEach((titel) =>
                expect(titel?.titel.toLowerCase()).toEqual(
                    expect.stringContaining(teilTitelVorhanden),
                ),
            );
    });

    test('Film zu nicht vorhandenem Titel', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    filme(titel: "${teilTitelNichtVorhanden}") {
                        genre
                        titel {
                            titel
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.filme).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Filme gefunden:/u);
        expect(path).toBeDefined();
        expect(path!![0]).toBe('filme');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */

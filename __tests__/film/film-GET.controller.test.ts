/* eslint-disable no-underscore-dangle */
/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type FilmModel } from '../../src/film/rest/film-get.controller.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const titelVorhanden = 'a';
const titelNichtVorhanden = 'xx';
const schlagwortVorhanden = 'javascript';
const schlagwortNichtVorhanden = 'csharp';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /rest', () => {
    let baseURL: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}/rest`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Alle Filme', async () => {
        // given

        // when
        const response: AxiosResponse<FilmModel> = await client.get('/');

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data).toBeDefined();

        const { filme } = data._embedded;

        filme
            .map((film) => film._links.self.href)
            .forEach((selfLink) => {
                // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                expect(selfLink).toMatch(new RegExp(`^${baseURL}`, 'u'));
            });
    });

    test('Filme mit einem Teil-Titel suchen', async () => {
        // given
        const params = { titel: titelVorhanden };

        // when
        const response: AxiosResponse<FilmModel> = await client.get('/', {
            params,
        });

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { filme } = data._embedded;

        // Jeder Film hat einen Titel mit dem Teilstring 'a'
        filme
            .map((film) => film.titel)
            .forEach((titel) =>
                expect(titel.titel.toLowerCase()).toEqual(
                    expect.stringContaining(titelVorhanden),
                ),
            );
    });

    test('Filme zu einem nicht vorhandenen Teil-Titel suchen', async () => {
        // given
        const params = { titel: titelNichtVorhanden };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Mind. 1 Film mit vorhandenem Schlagwort', async () => {
        // given
        const params = { [schlagwortVorhanden]: 'true' };

        // when
        const response: AxiosResponse<FilmModel> = await client.get('/', {
            params,
        });

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        // JSON-Array mit mind. 1 JSON-Objekt
        expect(data).toBeDefined();

        const { filme } = data._embedded;

        // Jeder Film hat im Array der Schlagwoerter z.B. "javascript"
        filme
            .map((film : FilmModel ) => film.schlagwoerter)
            .forEach((schlagwoerter : string[] | undefined) =>
                expect(schlagwoerter).toEqual(
                    expect.arrayContaining([schlagwortVorhanden.toUpperCase()]),
                ),
            );
    });

    test('Keine Filme zu einem nicht vorhandenen Schlagwort', async () => {
        // given
        const params = { [schlagwortNichtVorhanden]: 'true' };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Keine Filme zu einer nicht-vorhandenen Property', async () => {
        // given
        const params = { foo: 'bar' };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
});
/* eslint-enable no-underscore-dangle */

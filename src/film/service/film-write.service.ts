/**
 * Das Modul besteht aus der Klasse {@linkcode FilmWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { type DeleteResult, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    IsanExistsException,
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { Film } from '../entity/film.entity.js';
import { FilmReadService } from './film-read.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../../mail/mail.service.js';
import RE2 from 're2';
import { Schauspieler } from '../entity/schauspieler.entity.js';
import { Titel } from '../entity/titel.entity.js';
import { getLogger } from '../../logger/logger.js';

/** Typdefinitionen zum Aktualisieren eines Filmes mit `update`. */
export interface UpdateParams {
    /** ID des zu aktualisierenden Filmes. */
    readonly id: number | undefined;
    /** Film-Objekt mit den aktualisierten Werten. */
    readonly film: Film;
    /** Versionsnummer für die aktualisierenden Werte. */
    readonly version: string;
}

/**
 * Die Klasse `FilmWriteService` implementiert den Anwendungskern für das
 * Schreiben von Filmen und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class FilmWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Film>;

    readonly #readService: FilmReadService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(FilmWriteService.name);

    constructor(
        @InjectRepository(Film) repo: Repository<Film>,
        readService: FilmReadService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#mailService = mailService;
    }

    /**
     * Ein neuer Film soll angelegt werden.
     * @param film Der neu abzulegende Film
     * @returns Die ID des neu angelegten Filmes
     * @throws IsanExists falls die ISAN-Nummer bereits existiert
     */
    async create(film: Film): Promise<number> {
        this.#logger.debug('create: buch=%o', film);
        await this.#validateCreate(film);

        const filmDb = await this.#repo.save(film); // implizite Transaktion
        this.#logger.debug('create: buchDb=%o', filmDb);

        await this.#sendmail(filmDb);

        return filmDb.id!;
    }

    /**
     * Ein vorhandener Film soll aktualisiert werden.
     * @param film Das zu aktualisierende Film
     * @param id ID des zu aktualisierenden Films
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     * @throws VersionInvalidException falls die Versionsnummer ungültig ist
     * @throws VersionOutdatedException falls die Versionsnummer veraltet ist
     */
    // https://2ality.com/2015/01/es6-destructuring.html#simulating-named-parameters-in-javascript
    async update({ id, film, version }: UpdateParams): Promise<number> {
        this.#logger.debug(
            'update: id=%d, buch=%o, version=%s',
            id,
            film,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: Keine gueltige ID');
            throw new NotFoundException(`Es gibt kein Film mit der ID ${id}.`);
        }

        const validateResult = await this.#validateUpdate(film, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Film)) {
            return validateResult;
        }

        const filmNeu = validateResult;
        const merged = this.#repo.merge(filmNeu, film);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged); // implizite Transaktion
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!;
    }

    /**
     * Ein Film wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Filmes
     * @returns true, falls der Film vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: number) {
        this.#logger.debug('delete: id=%d', id);
        const film = await this.#readService.findById({
            id,
            mitSchauspieler: true,
        });

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            // Der Film zur gegebenen ID mit Titel und Abb. asynchron loeschen

            // TODO "cascade" funktioniert nicht beim Loeschen
            const titelId = film.titel?.id;
            if (titelId !== undefined) {
                await transactionalMgr.delete(Titel, titelId);
            }
            const mehrereschauspieler = film.mehrereschauspieler ?? [];
            for (const schauspieler of mehrereschauspieler) {
                await transactionalMgr.delete(Schauspieler, schauspieler.id);
            }

            deleteResult = await transactionalMgr.delete(Film, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(film: Film): Promise<undefined> {
        this.#logger.debug('#validateCreate: film=%o', film);

        const { isan } = film;
        try {
            await this.#readService.find({ isan: isan }); // eslint-disable-line object-shorthand
        } catch (err) {
            if (err instanceof NotFoundException) {
                return;
            }
        }
        throw new IsanExistsException(isan);
    }

    async #sendmail(film: Film) {
        const subject = `Neuer Film ${film.id}`;
        const titel = film.titel?.titel ?? 'N/A';
        const body = `Der Film mit dem Titel <strong>${titel}</strong> ist angelegt`;
        await this.#mailService.sendmail({ subject, body });
    }

    async #validateUpdate(
        film: Film,
        id: number,
        versionStr: string,
    ): Promise<Film> {
        const version = this.#validateVersion(versionStr);
        this.#logger.debug(
            '#validateUpdate: film=%o, version=%s',
            film,
            version,
        );

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): number {
        this.#logger.debug('#validateVersion: version=%s', version);
        if (
            version === undefined ||
            !FilmWriteService.VERSION_PATTERN.test(version)
        ) {
            throw new VersionInvalidException(version);
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #findByIdAndCheckVersion(id: number, version: number): Promise<Film> {
        const filmDb = await this.#readService.findById({ id });

        // nullish coalescing
        const versionDb = filmDb.version!;
        if (version < versionDb) {
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%d',
                version,
            );
            throw new VersionOutdatedException(version);
        }

        return filmDb;
    }
}

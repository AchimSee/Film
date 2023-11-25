/*
 * Copyright (C) 2023 - present Juergen Zimmermann, Hochschule Karlsruhe
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
import dotenv from 'dotenv';
import process from 'node:process';
import scanner from 'sonarqube-scanner';

// Umgebungsvariable aus .env einlesen
dotenv.config();
const sonarToken = process.env.SONAR_TOKEN;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        options: {
            'sonar.projectName': 'film',
            'sonar.projectDescription': 'Beispiel fuer Software Engineering',
            'sonar.projectVersion': '2023.1.0',
            'sonar.sources': 'src',
            'sonar.tests': '__tests__',
            'sonar.token': sonarToken,
            'sonar.scm.disabled': 'true',
            'sonar.javascript.environments': 'node',
        },
    },
    () => process.exit(),
);

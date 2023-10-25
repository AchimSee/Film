# syntax=docker/dockerfile:1.6.0

# Copyright (C) 2023 - Juergen Zimmermann, Hochschule Karlsruhe
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

# Aufruf:   docker build --sbom true --tag juergenzimmermann/buch:2023.10.0-distroless .
#               ggf. --progress=plain
#               ggf. --no-cache
#           Get-Content Dockerfile | docker run --rm --interactive hadolint/hadolint:2.12.1-beta-debian
#           docker network ls

# https://docs.docker.com/engine/reference/builder/#syntax
# https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md
# https://hub.docker.com/r/docker/dockerfile
# https://docs.docker.com/build/building/multi-stage
# https://github.com/textbook/starter-kit/blob/main/Dockerfile
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker

# Distroless-Image
#   - auf Basis von Debian 11 (bullseye)
#   - ohne Shell, Package Manager, GUI, grep, sed, awk, ...
#   - nur 2% der Größe von Debian und 50 % von Alpine
#   - mit Node 20 ca. 170 MB:
#   - von Google
#   - https://console.cloud.google.com/gcr/images/distroless/global/nodejs20-debian11

# ---------------------------------------------------------------------------------------
# S t a g e   b u i l d e r
# ---------------------------------------------------------------------------------------
ARG NODE_VERSION=20.8.1
FROM node:${NODE_VERSION}-bookworm AS builder

WORKDIR /home/node

COPY package.json package-lock.json nest-cli.json tsconfig*.json ./
COPY src ./src

# ggf. Python fuer re2 und Argon2
# https://packages.debian.org/bookworm/python3-minimal
# "python3-dev" enthaelt "multiprocessing"
# "build-essential" enthaelt "make"
# apt-get install --no-install-recommends --yes python3.11-minimal=3.11.2-6 python3.11-dev=3.11.2-6 build-essential=12.9

RUN npm i -g --no-audit --no-fund npm
# RUN <<EOF
# npm i -g --no-audit --no-fund npm
# chmod 666 package*.json
# EOF

USER node

RUN <<EOF
# ci (= clean install) mit package-lock.json
npm ci --no-audit --no-fund
npm i -D --no-audit --no-fund rimraf
npm run build
EOF

# ------------------------------------------------------------------------------
# S t a g e   D e p s
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /home/node

RUN npm i -g --no-audit --no-fund npm

USER node

COPY --chown=node:node package.json package-lock.json ./

# ci (= clean install) mit package-lock.json
# --omit dev: ohne devDependencies
RUN npm prune --omit=dev --omit=peer

# ------------------------------------------------------------------------------
# S t a g e   d u m b - i n i t
# ------------------------------------------------------------------------------
# gcr.io/distroless/nodejs20-debian12:nonroot basiert auf Debian Bookworm
FROM debian:bookworm-slim AS dumb-init

# dumb-init installieren, um im finalen Image "node" aufrufen zu koennen
RUN <<EOF
# Katalog der verfuegbaren Debian-Packages aktualisieren
apt-get update
# Das eigentliche "Update" der installierten Debian-Packages
apt-get upgrade
# https://github.com/Yelp/dumb-init
# https://packages.debian.org/bookworm/dumb-init
apt-get install --no-install-recommends --yes dumb-init=1.2.5-2
apt-get autoremove --yes
apt-get clean --yes
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
EOF

# ------------------------------------------------------------------------------
# S t a g e   F i n a l
# ------------------------------------------------------------------------------
# https://github.com/GoogleContainerTools/distroless
# https://console.cloud.google.com/gcr/images/distroless/global/nodejs20-debian11
FROM gcr.io/distroless/nodejs20-debian12:nonroot
# FROM gcr.io/distroless/nodejs20-debian12:debug-nonroot

# Anzeige bei "docker inspect ..."
# https://specs.opencontainers.org/image-spec/annotations
# https://spdx.org/licenses
# MAINTAINER ist deprecated https://docs.docker.com/engine/reference/builder/#maintainer-deprecated
LABEL org.opencontainers.image.title="buch" \
    org.opencontainers.image.description="Appserver buch mit distroless-Image" \
    org.opencontainers.image.version="2023.10.0-distroless" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    org.opencontainers.image.authors="Juergen.Zimmermann@h-ka.de"

WORKDIR /opt/app

COPY --chown=nonroot:nonroot package.json .env ./
COPY --from=deps --chown=nonroot:nonroot /home/node/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /home/node/dist ./dist
COPY --chown=nonroot:nonroot src/config/resources ./dist/config/resources
COPY --from=dumb-init /usr/bin/dumb-init /usr/bin/dumb-init

USER nonroot
EXPOSE 3000

# Bei CMD statt ENTRYPOINT kann das Kommando bei "docker run ..." ueberschrieben werden
# "Array Syntax" damit auch <Strg>C funktioniert
# https://github.com/Yelp/dumb-init:
# "a simple process supervisor and init system designed to run as PID 1 inside
# minimal container environments (such as Docker)""
ENTRYPOINT ["dumb-init", "/nodejs/bin/node", "dist/main.js"]

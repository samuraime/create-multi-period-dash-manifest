#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path'
import {Parser, Builder} from 'xml2js';
import {Duration} from 'luxon';

async function makeMultiPeriodsManifest(manifestName, assets) {
    const parser = new Parser();

    const manifests = await Promise.all(
        assets.map((asset) => (
            parser.parseStringPromise(
                fs.readFileSync(
                    path.resolve(`output/${asset}/stream.mpd`),
                    'utf-8'
                )
            )
        ))
    );

    const multiPeriodsManifest = manifests[0]; // Create from first manifest

    let nextPeriodStart = Duration.fromISO('PT0S');

    multiPeriodsManifest.MPD.Period = manifests.map(({MPD}, index) => {
        const representationIdPrefix = assets[index];
        const originalPeriod = MPD.Period[0];
        const modifiedPeriod = {
            ...originalPeriod,
            $: {
                ...originalPeriod.$,
                start: nextPeriodStart.toISO(),
            },
            AdaptationSet: originalPeriod.AdaptationSet.map((adapatation) => ({
                ...adapatation,
                Representation: adapatation.Representation.map((representation) => ({
                    ...representation,
                    $: {
                        ...representation.$,
                        id: `${representationIdPrefix}/${representation.$.id}`,
                    },
                })),
            })),
        };

        nextPeriodStart = nextPeriodStart.plus(Duration.fromISO(MPD.$.mediaPresentationDuration))
        
        return modifiedPeriod;
    });
    multiPeriodsManifest.MPD.$.mediaPresentationDuration = nextPeriodStart.toISO();
    
    const builder = new Builder();
    const xml = builder.buildObject(multiPeriodsManifest);
    const finalManifestFile = path.resolve(`output/${manifestName}.mpd`);

    fs.writeFileSync(finalManifestFile, xml);

    return finalManifestFile;
}

const mediaRecipes = {
    'ad-free': ['bbb'],
    'pre-roll-2-ads': ['ad1', 'ad2', 'bbb'],
    'mid-roll-2-ads': ['bbb_part1', 'ad1', 'ad2', 'bbb_part2'],
    'pre-roll-1-ad-mid-roll-1-ad': ['ad2', 'bbb_part1', 'ad1', 'bbb_part2'],
};

const generatedManifests = await Promise.all(
    Object.entries(mediaRecipes).map(([manifestName, assets]) => (
        makeMultiPeriodsManifest(manifestName, assets)
    ))
);

console.log('Generated manifests:');
console.log(generatedManifests.join('\n'));

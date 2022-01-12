const fs = require('fs/promises');
const path = require('path');
const activeWindow = require('active-win');
const { interval, startWith, switchMap, map, distinctUntilChanged, filter } = require('rxjs');

const PERIOD = 2000;
const MAPS_FOLDER = 'maps';

const trigger = interval(PERIOD);
const mapsPath = path.resolve(MAPS_FOLDER);

module.exports = async () => {
    const readAppConfiguration = async app => {
        const mapsList = await fetchMaps(mapsPath);

        const predicate = map => {
            if (typeof map.app === 'string')
                return map.app === app;

            const { regexp, options } = map.app;
            const rxp = new RegExp(regexp, options);

            return rxp.test(app);
        };

        const config = mapsList.find(predicate);

        return {
            title: app,
            ...config,
        };
    };

    return trigger
        .pipe(
            startWith(0),
            switchMap(() => activeWindow()),
            map((win) => win?.owner?.name),
            filter(name => !!name),
            distinctUntilChanged(),
            switchMap(readAppConfiguration),
        );
};

async function fetchMaps(folder) {
    const dir = await fs.readdir(folder);

    const readers = dir
        .filter(file => file.endsWith('.json'))
        .map(file => path.resolve(folder, file))
        .map(file => fs.readFile(file).then(JSON.parse));

    return (await Promise.all(readers));
}
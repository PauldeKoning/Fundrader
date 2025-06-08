import NodeCache from "node-cache";
import Building from "./building";
import BuildingLoader from "./buildingLoader";
import { getParseHTMLFromURL } from "./util";
import express from 'express';
import cors from "cors";

const cache = new NodeCache();

const app = express();
const port = 3000;

app.use(cors());

app.get('/house', (req, res) => {
    const used = req.query?.used;
    if (!used) {
        res.json(getRandomHouse(undefined));
    } else {
        if (typeof used !== 'string') res.json();
        res.json(getRandomHouse((used as string).split(',')));
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Refresh buildings every 5 min
setInterval(async () => {
    await refreshBuildings();
}, 1000 * 60 * 5);
void refreshBuildings();

function getRandomHouse(used: string[] | undefined) {
    const houseIds = cache.keys();
    if (!houseIds) {
        return;
    }

    const houseIdsNotUsed = houseIds.filter(h => !(used || []).includes(h));

    if (houseIdsNotUsed.length === 0) {
        return;
    }

    const randomId = houseIdsNotUsed[Math.floor(Math.random() * houseIdsNotUsed.length)];
    const cachedHouse = cache.get(randomId) as Building;

    if (!cachedHouse) {
        return;
    }    

    return cachedHouse;
}

async function refreshBuildings() {
    const overview = 'https://www.funda.nl/zoeken/koop?sort=%22date_down%22';
    const html = await getParseHTMLFromURL(overview);
    const pageLinks = html?.getElementsByTagName('a');
    const detailLinks = pageLinks?.map(p => p.rawAttributes.href).filter(p => p.includes('/detail/koop/'));
    const uniqueLinks =  [...new Set(detailLinks)];

    if (!uniqueLinks) {
        console.log('No unique links found, probably rate limited...');
    }

    uniqueLinks?.forEach(async (l, n) => {
        if (n > 4) return;
        await getBuildingWithPictures('https://www.funda.nl' + l);
    });
}

async function getBuildingWithPictures(link: string): Promise<Building | undefined> {
    const buildingLoader = new BuildingLoader(link);

    // First get ID to check for cache entry
    const id = buildingLoader.getID()?.id;
    if (!id) {
        return;
    }

    if (cache.has(id)) {
        return cache.get(id) as Building;
    }

    // Request data and add to cache for 12 hours
    await buildingLoader.getData();
    await buildingLoader.getCoords();
    await buildingLoader.getPictures();

    cache.set(id, buildingLoader.result, 60 * 60 * 12);

    return buildingLoader.result;
}
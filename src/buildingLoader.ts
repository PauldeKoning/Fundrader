import Building from "./building";
import { getParsedIntOrUndefined, getParseHTMLFromURL, getParseJSONFromURL } from "./util";

export default class BuildingLoader {

    private readonly url: string;
    public result: Building = {};

    constructor(url: string) {
        this.url = url;
    }

    getID() {
        const match = this.url.match(/\/(\d+)\/?$/);
        if (match?.at(1)) {
            this.result.id = match?.at(1);
        }
        return this.result;
    }

    async getPictures() {
        const html = await getParseHTMLFromURL(this.url + 'overzicht');
    
        if (!html) {
            return;
        }
    
        const pictures = html.getElementsByTagName('a');
        this.result.pictures = pictures.map(p => p.rawAttributes.href).filter(p => p.includes('/foto/'));
        return this.result;
    }

    async getData(): Promise<Building | undefined> {
        const html = await getParseHTMLFromURL(this.url);
    
        if (!html) {
            return;
        }
    
        let generalInfo, buildYear, cost, area;
        try {
            generalInfo = html.querySelector('#about > ul');
            buildYear = html.querySelector('#features > div:nth-child(3) > dl > dd:nth-child(6)');
            cost = html.querySelector('#features > div:nth-child(2) > dl > dd:nth-child(2) > span');
            area = html.querySelector('#about > div.relative.flex.justify-between > h1 > span.text-neutral-40');
        } catch (e) {
            console.error('Problem during query selector', e);
        }
        
    
        const sizeText = generalInfo?.childNodes.at(0)?.childNodes.at(1)?.innerText;
        const bedroomsText = generalInfo?.childNodes.at(-1)?.childNodes.at(1)?.innerText;
        const buildYearText = buildYear?.innerText;
        const costText = cost?.innerText;
        const areaText = area?.innerText;

        const parsedSize = getParsedIntOrUndefined(sizeText);
        const parsedBedrooms = getParsedIntOrUndefined(bedroomsText);
        
        // Bedrooms could be absent, don't use bedrooms if its less than 15, assuming there's no house with more than 15 bedrooms
        this.result = {
            ...this.result,
            size: parsedSize && parsedSize >= 15 ? parsedSize : undefined,
            bedrooms: parsedBedrooms && parsedBedrooms < 15 ? parsedBedrooms : undefined,
            buildYear: getParsedIntOrUndefined(buildYearText),
            cost: getParsedIntOrUndefined(costText),
            area: areaText,
        };
        return this.result;
    }

    async getCoords() {
        if (!this.result.area) {
            console.error('Area does not exist');
            return;
        }

        const postalcode = this.result.area.substring(0, 7).replace(' ', '');

        const locationJson = await getParseJSONFromURL(`https://nominatim.openstreetmap.org/search?postalcode=${postalcode}&format=json`);

        if (locationJson.length === 0 || !locationJson.at(0).lat || !locationJson.at(0).lon) {
            console.error('Location problem');
            console.error(locationJson);
            return;
        }

        this.result.lat = locationJson.at(0).lat;
        this.result.lon = locationJson.at(0).lon;
    }
}
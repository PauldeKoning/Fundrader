import parse from "node-html-parser";

export function getParsedIntOrUndefined(a: string | undefined) {
    try {
        // Replace any character that is NOT a number before parsing
        return a ? parseInt(a.replace(/[^0-9]/g, '')) : undefined;
    } catch (e) {
        console.error(`Problem while parsing int from '${a}'`, e);
    }
}

export async function getParseHTMLFromURL(url: string) {
    try {
        console.log('Requesting URL', url);
        const result = await fetch(url);
        const text = await result.text();
        return parse(text);
    } catch (e) {
        console.log(`Problem while getting HTML from URL ${url}`, e)
    }
}

export async function getParseJSONFromURL(url: string) {
    try {
        console.log('Requesting URL', url);
        const result = await fetch(url);
        return await result.json();
    } catch (e) {
        console.log(`Problem while getting JSON from URL ${url}`, e)
    }
}
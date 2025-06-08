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
        const result = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            }
        });
        const text = await result.text();
        return parse(text);
    } catch (e) {
        console.log(`Problem while getting HTML from URL ${url}`, e)
    }
}

export async function getParseJSONFromURL(url: string) {
    try {
        console.log('Requesting URL', url);
        const result = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            }
        });
        return await result.json();
    } catch (e) {
        console.log(`Problem while getting JSON from URL ${url}`, e)
    }
}
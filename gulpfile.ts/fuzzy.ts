import fuzzysort from "fuzzysort";
import * as fs from "fs";
import { join } from "path";

export async function generateSearchIndex() {
    const pagesDirectory = "_pages";
    if (!fs.existsSync(pagesDirectory)) {
        throw new Error("Pages directory '" + pagesDirectory + "' does not exists");
    }

    const fuzzyIndex: any[] = [];

    const pages = fs.readdirSync(pagesDirectory);
    for (const page of pages) {
        const lines = fs.readFileSync(join(pagesDirectory, page), "utf-8").split("\n");
        const titleAndSlug = extractTitleAndSlug(lines, page);
        const prepared = fuzzysort.prepare(titleAndSlug.title);
        fuzzyIndex.push({
            k: prepared,
            v: titleAndSlug.slug.substring(1, titleAndSlug.slug.length - 1),
        });
    }

    const indexDir = join("_site", "resources");
    if (!fs.existsSync(indexDir)) {
        fs.mkdirSync(indexDir, { recursive: true });
    }
    fs.writeFileSync(join(indexDir, "index.json"), JSON.stringify(fuzzyIndex), "utf-8");
}

function extractTitleAndSlug(lines: string[], page: string) {
    let title = "";
    let slug = "";
    for (const next of lines) {
        if (next.startsWith("shortTitle:")) {
            title = next.substring("shortTitle:".length).trim();

            if (title.startsWith("\"") || title.startsWith("'")) {
                title = title.substring(1).trimStart();
            }

            if (title.endsWith("\"") || title.endsWith("'")) {
                title = title.substring(0, title.length - 1).trimEnd();
            }

            if (title.startsWith("The ") || title.startsWith("the ")) {
                title = title.substring(4).trimStart();
            }
        } else if (next.startsWith("permalink:")) {
            slug = next.substring("permalink:".length).trim();
        } else {
            continue;
        }

        if (title.length > 0 && slug.length > 0) {
            break;
        }
    }

    if (title.length === 0 || slug.length === 0) {
        throw new Error("shortTitle or permalink not found in '" + page + "'");
    }

    return {
        title, slug,
    };
}

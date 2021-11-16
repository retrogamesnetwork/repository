import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import fuzzysort from "fuzzysort";
import { html } from "./html";

const indexFile = "/resources/index.json";
const maxItems = 7;

interface IndexDocument {
    k: string,
    v: string,
}

export function Search() {
    // eslint-disable-next-line
	const [indexJson, setIndexJson] = useState<any | null>(null);
    const [query, setQuery] = useState<string>("");
    const [items, setItems] = useState<Fuzzysort.KeyResult<IndexDocument>[]>([]);
    const [selected, setSelected] = useState<number>(-1);

    useEffect(() => {
        fetch(indexFile)
            .then((r) => r.json())
            .then(setIndexJson);
    }, []);

    useEffect(() => {
        if (query === "") {
            setItems([]);
            return;
        }

        const queryPromise = fuzzysort.goAsync<IndexDocument>(query, indexJson, {
            key: "k",
        });

        queryPromise.then((results) => {
            const items: Fuzzysort.KeyResult<IndexDocument>[] = [];
            for (const next of results) {
                items.push(next);
                if (items.length > maxItems) {
                    break;
                }
            }
            setItems(items);
            setSelected(0);
        });

        return () => {
            queryPromise.cancel();
        };
    }, [query]);


    const onQueryChange = (ev: Event) => {
        const newQuery = (ev.target as HTMLInputElement).value;
        if (indexJson === null || query === newQuery || newQuery.length === 0) {
            return [];
        }
        setQuery(newQuery);
    };

    const onKeyUp = (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
            openSlug(items[selected].obj.v);
            return;
        }

        let newSelected = selected;
        if (ev.key === "ArrowUp") {
            newSelected--;
            ev.stopPropagation();
            ev.preventDefault();
        }

        if (ev.key === "ArrowDown") {
            newSelected++;
            ev.stopPropagation();
            ev.preventDefault();
        }

        if (newSelected < 0) {
            newSelected = items.length - 1;
        }

        if (newSelected >= items.length) {
            newSelected = 0;
        }

        if (newSelected !== selected) {
            setSelected(newSelected);
        }
    };

    return html`<div class="search-content not-prevent-key-events relative">
        <input 
            class="px-4 py-2 font-xl bg-gray-200 border border-gray-500 w-full filter drop-shadow-xl" 
            placeholder="Search game..." 
            onInput=${onQueryChange}
            onKeyDown=${onKeyUp}
            />
        <ul class="absolute top-full bg-white left-0 right-0 px-2 
            border border-gray-300 ${items.length === 0 ? "hidden" : ""}">
            ${
                items.map((item, i) => {
                    return html`<li onClick=${() => openSlug(item.obj.v)} class="cursor-pointer text-xl py-2 px-4 border-b hover:bg-blue-300 ${ i === selected ? "bg-green-300" : ""}">${item.target}</li>`;
               })
            }
        </ul>
    </div>`;
}

function openSlug(slug: string) {
    window.location.pathname = "/" + slug + "/";
}

export function initSearch() {
    const domContainer = document.querySelector("#search");
    if (domContainer !== null) {
        render(html`<${Search} />`, domContainer);
    }
}
/*

        <Suggest
            disabled={indexJson === null}
            items={items}
            onQueryChange={onQueryChange}
            noResults={<div>No Results</div>}
            inputValueRenderer={(item) => item.target}
            itemRenderer={(item, props) =>
                <MenuItem
                    active={props.modifiers.active}
                    onClick={props.handleClick}
                    key={query + "-" + item.obj.v}
                    text={<div dangerouslySetInnerHTML={{ __html: fuzzysort.highlight(item) || "-" }} ></div>}
                />
            }
            inputProps={{
                leftIcon: IconNames.SEARCH,
                large: true,
                round: true,
            }}
            popoverProps={{
                minimal: true,
                usePortal: false,
                fill: true,
            }}
            onItemSelect={(i) => openSlug(i.obj.v)}
        />



       */
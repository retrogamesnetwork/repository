import ReactDom from "react-dom";
import React, { useEffect, useState } from "react";

import { Button, Intent, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Suggest } from "@blueprintjs/select";

import fuzzysort from "fuzzysort";

const indexFile = "/resources/index.json";
const maxItems = 30;

interface IndexDocument {
	k: string,
	v: string,
}

export function Search() {
	// eslint-disable-next-line
	const [indexJson, setIndexJson] = useState<any | null>(null);
	const [query, setQuery] = useState<string>("");
	const [items, setItems] = useState<Fuzzysort.KeyResult<IndexDocument>[]>([]);

	useEffect(() => {
		fetch(indexFile)
			.then(r => r.json())
			.then(setIndexJson)
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
		});

		return () => {
			queryPromise.cancel();
		};
	}, [query]);


	const onQueryChange = (newQuery: string) => {
		if (indexJson === null || query === newQuery) {
			return [];
		}

		setQuery(newQuery);
	};

	return <div className="search-content">
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
			onItemSelect={i => openSlug(i.obj.v)}
		/>
		<Button minimal={true} large={true} icon={IconNames.HEART} intent={Intent.DANGER} onClick={openFavorites} />
	</div>;
}

function openSlug(slug: string) {
	window.location.pathname = "/" + slug + "/";
}

function openFavorites() {
	window.location.pathname = "/en/my";
}


export function initSearch() {
	const domContainer = document.querySelector("#search");
	if (domContainer !== null) {
		ReactDom.render(<Search />, domContainer);
	}
}
import os
import re
import yaml

for root, dirs, files in os.walk("."):
    for file in files:
        njk = os.path.join(root, file)
        if njk.endswith(".njk"):
            with open(njk, "r") as file:
                lines = file.read().split("\n")
            
            if not(lines[0].startswith("---")):
                continue

            end = 1
            while not(lines[end].startswith("---")):
                end += 1

            meta = yaml.safe_load("\n".join(lines[1:end]))
            
            field = "ogDescription"
            if not(field in meta) or not("shortTitle" in meta):
                continue

            meta[field] = (meta["shortTitle"] + 
                " is a famous and most played DOS game that now is available to play in browser. With virtual" +
                " mobile controls you also can play in " + meta["shortTitle"] + 
                " on mobile. On DOS.Zone " + meta["shortTitle"] + " available to play for free without registration.")

            meta = yaml.dump(meta, default_flow_style=False, allow_unicode=True)
            lines = [lines[0]] + meta.split("\n") + lines[end:]
            with open(njk, "w") as file:
                file.write("\n".join(lines))
        
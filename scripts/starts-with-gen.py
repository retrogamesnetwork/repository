def render(symbolFile, symbolName, collection):
    with open("scripts/catalog_symbol.njk.in", "r") as file:
        content = file.read()

    content = content.replace("{%SYMBOL%}", symbolName)
    content = content.replace("{%COLLECTION%}", collection)

    with open("_starts/with/" + symbolFile + ".njk", "w") as file:
        file.write(content)

render("0-9", "number", "num")

letters = "qwertyuiopasdfghjklzxcvbnm"
for letter in letters:
    render(letter, letter, letter)
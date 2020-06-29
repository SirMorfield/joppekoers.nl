geheim = "jan"
aantal = len(geheim)
vv = True
while vv == True:
    antw = input("Raad eends een woord : ")
    antw = antw.lower()

    if len(antw) > len(geheim):
        print("Te veel letters")

    elif len(antw) < len(geheim):
        print("Te weinig letters")

    else:
        if geheim == antw:
            print("Correct, het was: " + geheim)

            vv = False
        else:
            for a in range(len(antw)):
                if (antw[a] == geheim[a]):
                    print(letter, end="")
                elif antw[a] in geheim:
                    print("?", end="")
                else:
                  print("-", end="")
            print("")

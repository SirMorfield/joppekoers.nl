import random
import time
wrong = 0
aantal = 0
flag = True
jj = True

#Controleer of het woord alleen uit lettters bestaad
arr =["^", "[", "!", "#", "$", "&", ",", "(", ")", "*", "+", ",",
        "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "]", "_",
       "`", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "]


#algoritme om het langste woord te vinden
arrz = [ ]
lijst = [line.strip() for line in open("lower.txt", 'r')]
lijstLen = int((len(lijst))-1)
eerste = lijst[0]
for d in range(len(lijst)):
    f = lijst[d]
    if(len(f) > len(eerste)):
        arrz.append(f)
        eerste = f

bigWord = arrz[(len(arrz))-1]

#het legen van variables om het interferen te voorkomen
arrz = None
b = None
d = None
f = None

#algoritme om het kortste woord te vinden
arrg = [ ]
eerste = lijst[0]
for d in range(len(lijst)-1):
    f = lijst[d]
    if(len(f) < len(eerste)):
        arrg.append(f)
        eerste = f
smallWord= arrg[(len(arrg))-1]
arrg = None
b = None
d = None
f = None


small = str(len(smallWord))
big = str(len(bigWord))
ik = True
#dit is een probleem in python, bij input kan ik geen str() gebruiken, bij print() kan dat wel
level = input("Welke moeilijkheidsgraad wil je? (Van "+ small + " tot en met " + big + " letters.)")

#controleer of het woord alleen uit cijfers bestaat, "gdsg" gaat niet in een int(), en daarom crashed het programma. (fool-proofing
while ik == True:
    if(level.isalpha() == True):
        print("Alleen cijfers!")
        level = input("Welke moeilijkheidsgraad wil je? (Van "+ small + " tot en met " + big + " letters.)")
    else:
        ik = False
        level = int(level)

#controleer of het cijfer niet te groot of te klein is
if(level > int(big) or level < int(small)):
    print("Kies een getal van "+ small + " tot en met " + big + " letters.)")

"""
(hieronder) willekeurig getal generen en daarmee een woord zoeken, als het woord dezelfde lengte heeft als het level
dan gaat het programma verder, zoniet gaat hij verder net zolang totdat het een woord heeft gevonde met de juiste lengte
 het is mogelijk dat het programma hier vastloopt omdat het een woord moet vinden met een lengte die maar een of twee
 keer voorkomt. Dit kan even duren omdat de woordenlijst uit 1.8M woorden bestaat. Het is niet te verbertern omdat
 anders het woord niet volledig random gekozen wordt. Het hangt dus af van de snelheid van de computer, op een
 normale laptop moet het niet langer duren dan een paar seconden.
"""
flag = True
o = random.randint(0, lijstLen)
geheim = lijst[o]
o = random.randint(0, lijstLen)
geheim = lijst[o]

while (flag == True):
    if (int(len(geheim)) == level):
        flag = False
    elif(int(len(geheim)) != level):
        o = random.randint(0, lijstLen)
        geheim = lijst[o]


vv = True
while vv == True:
    #beginnen van de tijd en het tellen va het aantal pogingen
    print("")
    antw = input("Raad het woord : ")
    aantal += 1
    ticks = time.time()
    antw = antw.lower()

    #controleer of het woord alleen uit leters bestaat
    for i in range(len(arr)):
        if arr[i] in antw:
            if (wrong == 0):
                print("Woorden bestaan alleen uit letters")
                wrong = 1

    if len(antw) > len(geheim):
        print("Te veel letters")
    elif len(antw) < len(geheim):
        print("Te weinig letters")

    else:
        if geheim == antw:
            print("")
            scores = []
            print("Correct, het was: " + geheim)
            duur = time.time() - ticks

            #converteer de seonden naar hh:mm:ss
            m, s = divmod(duur, 60)
            h, m = divmod(m, 60)
            duurFinal = "%d:%02d:%02d" % (h, m, s)
            print("Tijsduur: "+ str(duurFinal))

            #score berekenen
            score = duur / int(aantal)
            score = (score * 1000) * int(level)

            print("Score :" + str(int(score)))
            print("Level: " + str(level))
            print("Pogingen: " + str(aantal))
            naam = input("Je naam:")

            #informatie over het gespeelde spel opslaan (zie: allescores.txt)
            #in deze volgorde: (score) (naam speler) (tijdsduur) (level) (pogingen)
            scores.append(str(score))
            scores.append(str(naam))
            scores.append(str(duur))
            scores.append(str(level))
            scores.append(str(aantal))
            allescores = open("allescores.txt", 'a')
            allescores.write(str(scores))
            allescores.write("\n")
            allescores.close()
            vv = False
        else:
            #de rest van de code die voor het daatwerkelijke spel zorgt
            for a in range(len(antw)):
                letter = antw[a]
                if (antw[a] == geheim[a]):
                    print(letter, end="")
                elif antw[a] in geheim:
                    print("?", end="")
                else:
                  print("-", end="")
            print("")
    wrong = 0






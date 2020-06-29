import random
import time
wrong = 0
aantal = 0  #aantal pogingen
flag = True
jj = True

arr =["^", "[", "!", "#", "$", "&", ",", "(", ")", "*", "+", ",",
        "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "]", "_",
       "`", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "]

arrz = [ ]
lijst = [line.strip() for line in open("lower.txt", 'r')]
lijstLen = int((len(lijst))-1)

eerste = lijst[0]
for d in range(len(lijst)):
    f = lijst[d]
    if(len(f) > len(eerste)):
        arrz.append(f)
        eerste = f
        #print(f)
bigWord = arrz[(len(arrz))-1]
#print(bigWord)
arrz = None
b = None
d = None
f = None

arrg = [ ]
eerste = lijst[0]
for d in range(len(lijst)-1):
    f = lijst[d]
    if(len(f) < len(eerste)):
        arrg.append(f)
        eerste = f
        #print(f)

smallWord= arrg[(len(arrg))-1]
#print(smallWord)
arrg = None
b = None
d = None
f = None
#---------------------------------------------------------------------------------------------------------------------------------


small = str(len(smallWord))
big = str(len(bigWord))
ik = True
level = input("Welke moeilijkheidsgraad wil je? (Van "+ small + " tot en met " + big + " letters.)")
while ik == True:
    if(level.isalpha() == True):
        print("Alleen cijfers!")
        level = input("Welke moeilijkheidsgraad wil je? (Van "+ small + " tot en met " + big + " letters.)")
    else:
        ik = False
        level = int(level)

#if(level > big or level < small):
 #   print("Kies een getal van "+ small + " tot en met " + big + " letters.)")

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


print("geheim:      " + geheim)

#----------------------------------------------------888

vv = True
while vv == True:
    antw = input("Raad het woord : ")
    aantal += 1
    ticks = time.time()
    antw = antw.lower()

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
            scores = [] #(score) ! (naam speler) (tijdsduur) (level) (pogingen)
            print("Correct, het was: " + geheim)
            duur = time.time() - ticks
            m, s = divmod(duur, 60)
            h, m = divmod(m, 60)
            duurFinal = "%d:%02d:%02d" % (h, m, s)
            print("Tijsduur: "+ str(duurFinal))

            score = duur / int(aantal)
            score = (score * 1000) * int(level)

            print("Score :" + str(int(score)))
            print("Level: " + str(level))
            print("Pogingen: " + str(aantal))
            naam = input("Je naam:")

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




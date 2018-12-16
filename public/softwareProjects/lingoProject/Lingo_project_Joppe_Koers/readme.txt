Package includes:
- 100% willekeurig woord uit nederlanse woordenlijst, gebasseerd op het ingevoerde level
- telling van aantal pogingen
- tijdsduur van het spel in hh:mm:ss
- verschillende levels
- score gebasseerd op tijdsduur, pogingen, level
- fool-proof bijvoorbeeld: wanneer de gebruiker bij het level een woord opschrijft crahed het programma niet, maar het vraagt nogmaals om een level
- bestand met scores en naam van de spelers samen met overige informatie
- mogelijkheid om je score op te slaan met je naam
- het bestand met de woorden kan makkelijk worden vervangen door een ander.

Gebrekken:
- algortime op het langste en kortste woord te vinden kan beter
- niet 100% fool proof


Errors/ bugs gevonden in python:
- geen mogelijkheid om variabels in een str() te zetten bij het command input(), dit kan wel in een print()command
- gebrekkige support voor umlaut en dergelijke vreemde letters
- het woord "random" als variable interfeert met de functie random.randint()
- len() telt vanaf 1 en arr[] telt vanaf 0, dit zorgt voor verwarring
- een txt file kan maar een keer gelezen worden na het openen, daarna moet het weer gesloten worden en weer geopend om verder te lezen
- end='' werkt soms wel, soms niet
- de ""#comment" mannier om comments toe te voegen heeft een andere kleur dan de " """comment""" "
- geen nogelijkheid om één dubbele aanhalingsteken tusen aanhalingstekens te zetten
- sommige functies in pycharm worden niet met een andere kleur weergegven:
                                                    - random.randint()
                                                    - .append()
                                                    - end=""
                                                    - .isalpha()


setInterval(() => {
  //time in minutes
  let min = (parseInt((new Date()).getHours()) * 60) + parseInt(new Date().getMinutes());
  let lesuur;

  if (min >= 510 && min < 585) lesuur = 1;
  else if (min >= 585 && min < 645) lesuur = 2;

  else if (min >= 675 && min < 735) lesuur = 3;
  else if (min >= 735 && min < 795) lesuur = 4;

  else if (min >= 825 && min < 885) lesuur = 5;
  else if (min >= 885 && min < 945) lesuur = 6;
  else if (min >= 960 && min <= 1020) lesuur = 7;

  if (lesuur) {
    document.querySelector('#schedule > center > table:nth-child(5) > tbody > tr:nth-child(' + (lesuur * 2) + ') > td:nth-child(1)').style.backgroundColor = 'rgb(246,105,94)';
    document.querySelector('#schedule > center > table:nth-child(5) > tbody > tr:nth-child(' + ((lesuur - 1) * 2) + ') > td:nth-child(1)').style.backgroundColor = 'rgb(255,255,255)';
  }
}, 1000);

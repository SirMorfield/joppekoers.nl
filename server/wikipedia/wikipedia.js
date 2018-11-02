const wikipedia = () => {


  let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&list=allpages&format=json&search=';
  let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=&format=json&titles=';

  let getNames = function () {
    let allNames = [];
    let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    let promiseGetAllNames = [];
    letters.forEach(function (letter, index) {
      promiseGetAllNames.push(
        new Promise(function (resolve, reject) {
          request(searchUrl + letter, function (err, status, resp) {
            resp = JSON.parse(resp);
            resp[1].forEach(function (pageName, index) {
              allNames.push(pageName.replace(/\s+/g, '_'));
            });
            resolve();
          });
        })
      );
    });

    Promise.all(promiseGetAllNames).then(function () {
      wikipedia.put('pageNames', allNames);
      // console.log('done');
    });
  };

  let getContent = function () {
    let promiseGetAllContent = [];
    let allContent = [];
    wikipedia.get('pageNames').forEach(function (pageName, index) {
      // ['a'].forEach(function (pageName, index) {
      promiseGetAllContent.push(
        new Promise(function (resolve, reject) {
          request(contentUrl + pageName, function (err, status, resp) {
            if (resp && typeof resp == 'string') {
              resp = JSON.parse(resp);
              let pageId = Object.keys(resp.query.pages)[0];
              let content = resp.query.pages[pageId].extract;
              allContent.push(content);
            } else {
              console.log('Fault at: ', pageName, ' at: ', index);
            }
            resolve();
          });
        })
      );
    });

    Promise.all(promiseGetAllContent).then(function () {
      wikipedia.put('allContent', allContent);
      console.log('done');
    });
  };

  function countConjunctions() {
    let startTime = Date.now();
    let conjunctions = [
      ["and", 0],
      ["or", 0],
      ["but", 0],
      ["nor", 0],
      ["so", 0],
      ["for", 0],
      ["yet", 0],
      ["after", 0],
      ["although", 0],
      ["as", 0],
      ["as if", 0],
      ["as long as", 0],
      ["because", 0],
      ["before", 0],
      ["even if", 0],
      ["even though", 0],
      ["once", 0],
      ["since", 0],
      ["so that", 0],
      ["though", 0],
      ["till", 0],
      ["unless", 0],
      ["until", 0],
      ["what", 0],
      ["when", 0],
      ["whenever", 0],
      ["wherever", 0],
      ["whether", 0],
      ["while", 0],
      ["a", 0]
    ];
    let comparisons = 0;
    // let allContent = [wikipedia.get('allContent')[0], wikipedia.get('allContent')[1]];
    let allContent = wikipedia.get('allContent');
    let wordsArr = [];
    allContent.forEach(function (content, index) {
      wordsArr.push(content.split(' '));
    });

    function flatten(arr) {
      return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
    }
    wordsArr = flatten(wordsArr);

    wordsArr.forEach(function (word, index) {
      conjunctions.forEach(function (conjunction, index) {
        // console.log(conjunction[0], ' ', word.toLowerCase())
        if (conjunction[0] == word.toLowerCase()) {
          conjunctions[index][1] += 1;
          // console.log('ye');
        }
        comparisons += 1;
      });
    });
    conjunctions = conjunctions.sort(function (a, b) {
      return b[1] - a[1];
    })
    wikipedia.put('conjunctions', conjunctions);
    wikipedia.put('comparisons', comparisons);
    console.log('CONJUNCTIONS: ', conjunctions);
    console.log('COMPARISONS: ', comparisons);
    console.log('TOTAL WORDS: ', wordsArr.length);
    console.log('done ', ((Date.now() - startTime) / 1000).toFixed(3), 's');
  }
  countConjunctions();
}

module.exports = {
  wikipedia: wikipedia
}

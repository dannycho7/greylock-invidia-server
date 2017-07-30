var elasticsearch = require('elasticsearch');
var path = require('path');
var express = require('express');

var app = express();

var client = new elasticsearch.Client({
  host: 'https://search-video-ctrlf-data-domain-rjmz52jbb3uwojr7uv42rmcndm.us-west-2.es.amazonaws.com',
  log: 'trace'
});

function connectToClient() {
  client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      console.error('Elasticsearch cluster is down!');
    } else {
      console.log('Elasticsearch cluster connection working.');
    }
  });
}

function searchVideoData(searchPhrase) {
  var searchKeywords = searchPhrase.split(" ");

  return new Promise((res, rej) => {
    client.search({
    index: 'youtube-video-data-index',
    body: {
      query: {
        match: {
          "cues.text": searchPhrase
        }
      }
    }
  }, function(error, response) {
    //res(response.hits.hits);

    console.log('Response: ' + JSON.stringify(response));
    // Go through each video
    for (var i = 0; i < response.hits.hits.length; i++) {

        var video_id = response.hits.hits[i]._source.video_id;

        var occurancesArray = [];
        // Go thorugh each line in the video
        for (var j = 0; j < response.hits.hits[i]._source.cues.length; j++) {
          console.log("TEXT: " + response.hits.hits[i]._source.cues[j].text);
          if (response.hits.hits[i]._source.cues[j].text) {
            var textWords = response.hits.hits[i]._source.cues[j].text.split(" ");

            var common = 0;
            for (var x = 0; x < textWords.length; x++) {
                for (var y = 0; y < searchKeywords.length; y++) {
                    if(textWords[x] === searchKeywords[y]) {
                        common++;
                    }
                }
            }
            occurancesArray.push(common);
            //occurancesArray = removeConsecutive(occurancesArray);
            if (common > 1) {
              console.log('Timestamp: ' + response.hits.hits[i]._source.cues[j].timestamp);
            }
          }
        }
        function isAllZero(element, index, array){
            return element == 0;
        }

        if(occurancesArray.every(isAllZero)){
          continue;
        }

        console.log("COMMON OCCURANCES ARRAY: " + occurancesArray.toString());

        for(var k = 0; k < occurancesArray.length; k++){
            if(occurancesArray[k] != 0){
                var counter = k+1;
                while(occurancesArray[counter] != 0 && counter < occurancesArray.length){
                  counter++;
                }
                if(counter-1 != k){
                  //array.fill(0, i+1, counter);
                  //console.log(array.fill(0, i+1, counter));
                  occurancesArray = occurancesArray.fill(0, k+1, counter);
                  console.log(occurancesArray.fill(0, k+1, counter));
                }
                k = counter-1;
            }
        }

        var dictionary = {};
        var tempIndex = 0;
        occurancesArray.forEach(function(element){
          dictionary[tempIndex] = element
          tempIndex++;
        })

        var sortable = [];
        for (var vehicle in dictionary) {
            sortable.push([vehicle, dictionary[vehicle]]);
        }
        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        sortable.reverse();

        sortable = sortable.filter(function(occurances){
          return occurances[1] > 0;
        });

        console.log("COMMON OCCURANCES ARRAY 2: " + sortable.toString());
        for(var j = 0; j < sortable.length; j++){
          sortable[j][2] = response.hits.hits[i]._source.cues[parseInt(sortable[j][0])]["text"];
          console.log(          sortable[j][2] = response.hits.hits[i]._source.cues[parseInt(sortable[j][0])]["text"];
);
          sortable[j][0] = response.hits.hits[i]._source.cues[parseInt(sortable[j][0])].timestamp; // Timestamp
        }


        response.hits.hits[i]._source.cues = sortable;
        console.log(response.hits.hits[i]._source.cues);
      }

      res(response.hits.hits);
    //  res(response.hits.hits);
    });
  })
}


connectToClient();

app.get("/search", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  searchVideoData(req.query.q)
  .then((data) => {
    console.log(data);
    res.json(data);

  });
});

app.listen(process.env.PORT || 5000, () => console.log("Server started"));

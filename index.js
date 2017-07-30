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
          occurancesArray = removeConsecutive(occurancesArray);
          if (common > 1) {
            console.log('Timestamp: ' + response.hits.hits[i]._source.cues[j].timestamp);
          }
        }

        console.log("COMMON OCCURANCES ARRAY: " + occurancesArray.toString());

        for(var i = 0; i < occurancesArray.length; i++){
            if(occurancesArray[i] != 0){
                var counter = i+1;
                while(occurancesArray[counter] != 0 && counter < occurancesArray.length){
                  counter++;
                }
                if(counter-1 != i){
                  //array.fill(0, i+1, counter);
                  //console.log(array.fill(0, i+1, counter));
                  occurancesArray = occurancesArray.fill(0, i+1, counter);
                  console.log(occurancesArray.fill(0, i+1, counter));
                }
                i = counter-1;
            }
        }

        //[3,0,0, 5 ,0]

        var newarray =
  });
  })
  res(response.hits.hits);

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

app.listen(process.env.PORT || 3000, () => console.log("Server started"));

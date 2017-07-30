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

        /*
        sendVideoDataToClient(response.hits.hits[i]._source.cues[j], i * j);
        // i is for video_id
        searchVideoDataForTimestamps(response.hits.hits[i]._source.cues[j], searchPhrase);
        */
      }

      //sendVideoDataToClient(JSON.stringify(response.hits.hits[i]._source.cues), i);
    }
    return response.hits.hits;
    /*
    for (var i = 0; i < response.hits.hits.length; i++) {
      // Send back this video id
      var singleVideoData = response.hits.hits[i]._source;
      var video_id = JSON.stringify(response.hits.hits[i]._source.video_id);
      console.log('Video id response: ' + video_id);
    }
    */
  });
}

function sendVideoDataToClient(data, indexNo) {
	client.index({
	  index: 'youtube-video-cues-data-index',
	  type: 'caption-data',
	  id: indexNo.toString(),
	  body: data
	}, function (error, response) {

	});
}

function searchVideoDataForTimestamps(singleVideoData, searchPhrase) {
  var timeStamps = [];

  client.search({
    index: 'youtube-video-data-index',
    body: {
      query: {
        match: {
          "text": searchPhrase
        }
      }
    }
  }, function(error, response) {
    console.log('Response: ' + JSON.stringify(response));
  });
}

/*
function searchVideoDataForTimestamps(singleVideoData, searchPhrase) {
  var timeStamps = [];
  var transcriptText = "";
  for (var i = 0; i < singleVideoData.cues.length; i++) {
    transcriptText += singleVideoData.cues[i].text;
    if (text) {
      var timestampText = text.replace("&#39;", "'").replace("&#34;", "").toLowerCase();
      if (timestampText.includes(searchPhrase)) {
        console.log("TIMESTAMP: " + singleVideoData.cues[i].timestamp);
        timeStamps.push(singleVideoData.cues[i].timestamp);
      }
    }
  }
  var sentences = transcriptText.split(".");
  sentences = sentences.split("?");
  sentences = sentences.split("!");
  for (var i = 0; i < sentences.length; i++) {
    if (sentences.contain)
  }
  return timeStamps;
}
*/

//connectToClient();
searchVideoData("Welcome to the late show");

/*
app.get("/search", (req, res) => {
    res.json(searchVideoData(req.query.q));
});
app.listen(process.env.PORT || 3000, () => console.log("Server started"));

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
    res(response.hits.hits);


  });
  })

}


connectToClient();

app.get("/search", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  searchVideoData(req.query.q)
  .then((data) => {
    res.json(data);
  });
});

app.listen(process.env.PORT || 3000, () => console.log("Server started"));

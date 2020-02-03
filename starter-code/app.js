require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  res.render('home');
})

app.post('/artists-search', (req, res) => {
  artistsName = req.body.artists;
  spotifyApi
  .searchArtists(artistsName)
  .then(data => {
    let artists = data.body.artists.items;
    res.render('artist-search-results', { artists });
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/artist/:artistId', (req, res) => {
  let artistId = req.params.artistId;
  spotifyApi.getArtistAlbums(artistId).then(
    function(data) {
      let albums = data.body.items;
      res.render('artist-albums', { albums });
    },
    function(err) {
      console.error(err);
    }
  )
})

app.get('/album/:albumId', (req, res) => {
  let albumId = req.params.albumId;
  spotifyApi.getAlbumTracks(albumId, { limit : 20, offset : 1 })
  .then(function(data) {
    console.log(data.body.items);
    let album = data.body.items;
    res.render('album-tracks', { album });
  }, function(err) {
    console.log('Something went wrong!', err);
  });
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));

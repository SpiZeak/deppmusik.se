/* global Spotify */

import React, { Component } from 'react';
import * as $ from 'jquery';
import { authEndpoint, clientId, redirectUri, scopes } from './config';
import hash from './hash';
import Player from './Player';
import './App.css';

let player;

class App extends Component {
  constructor() {
    super();

    this.state = {
      token: null,
      item: null,
      paused: true,
      progress_ms: 0,
    };
  }

  componentDidMount() {
    let _token = hash.access_token;

    if (_token) {
      this.setState({
        token: _token,
      });
    } else {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
        '%20',
      )}&response_type=token&show_dialog=true`;
    }

    window.onSpotifyPlayerAPIReady = () => {
      player = new Spotify.Player({
        name: 'Web Playback SDK Template',
        getOAuthToken: cb => {
          cb(_token);
        },
      });

      // Error handling
      player.on('initialization_error', e => console.error(e));
      player.on('authentication_error', e => console.error(e));
      player.on('account_error', e => console.error(e));
      player.on('playback_error', e => console.error(e));

      // Playback status updates
      player.on('player_state_changed', state => {
        $('#current-track').attr(
          'src',
          state.track_window.current_track.album.images[0].url,
        );
        $('#current-track-name').text(state.track_window.current_track.name);
      });

      // Ready
      player.on('ready', async data => {
        // Get random track from playlist
        let track = (await this.getRandomTrack()).items;
        track = track[Math.floor(Math.random() * track.length)].track;

        // Play a track using our new device ID
        this.play(data.device_id, this.state.token, track.uri);
      });

      // Connect to the player!
      player.connect();

      player.on('player_state_changed', data => {
        this.setState({
          paused: data.paused,
          item: data.track_window.current_track,
        });
      });
    };
  }

  getRandomTrack = () => {
    return $.ajax({
      url: 'https://api.spotify.com/v1/playlists/5jSQqoEWwTH1WuwNBBcTa1/tracks',
      type: 'GET',
      beforeSend: xhr => {
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.state.token);
      },
    });
  };

  play = (device_id, token, track) => {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: `{"uris": ["${track}"]}`,
      beforeSend: xhr => {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
    });
  };

  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          {this.state.item && (
            <Player
              item={this.state.item}
              paused={this.state.paused}
              progress_ms={this.progress_ms}
            />
          )}
        </header>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import * as $ from 'jquery';
import { authEndpoint, clientId, redirectUri, scopes } from './config';
import hash from './hash';
import Player from './Player';
import './App.css';

let player;

/* global Spotify */

class App extends Component {
  constructor() {
    super();

    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: '' }],
        },
        name: '',
        artists: [{ name: '' }],
        duration_ms: 0,
      },
      is_playing: 'Paused',
      progress_ms: 0,
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token,
      });
      this.getCurrentlyPlaying(_token);
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
      player.on('ready', data => {
        console.log('Ready with Device ID', data.device_id);

        // Play a track using our new device ID
        this.play(data.device_id, this.state.token);
      });

      //Connect to the player!
      player.connect();
    };
  }

  play = (device_id, token) => {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}',
      beforeSend: xhr => {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      success: data => {
        this.getCurrentlyPlaying();
      },
    });
  };

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player',
      type: 'GET',
      beforeSend: xhr => {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      success: data => {
        console.log(data);
        if (data) {
          this.setState({
            item: data.item,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms,
          });
        }
      },
    });
  }

  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          {this.state.token && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.progress_ms}
            />
          )}
        </header>
      </div>
    );
  }
}

export default App;

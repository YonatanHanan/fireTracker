import React, {Component} from 'react';
import '../css/Torrent.css';
import {fire, storage} from '../firebase.js';

import MovieShow from '../components/MovieShow';
import Miscellaneous from '../components/Miscellaneous';
import Music from '../components/Music';
class Torrent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            torrent: {},
            apiData: {},
            loaded: false,
            downloadLink: ""
        };

        this.downloadTorrent = this
            .downloadTorrent
            .bind(this);
    }
    componentDidMount() {
        let torrentRef = fire
            .database()
            .ref('torrents/' + window.location.pathname.split("/")[2]);

        torrentRef.on('value', (snapshot) => {
            this.setState({loaded: false});
            let torrent = snapshot.val();
            console.log(!torrent || torrent == null);
            if (!torrent || torrent == null) {
                this
                    .props
                    .history
                    .push('/');
                    return;
            }
            let up = 0;
            let down = 0;
            if (torrent.hasOwnProperty("clients")) {
                Object
                    .values(torrent.clients)
                    .forEach(peer => {
                        if (peer === "Seeder") {
                            up++;
                        } else if (peer === "Downloader") {
                            down++;
                        }
                    });
                torrent["up"] = up;
                torrent["down"] = down;
            } else {
                torrent["up"] = 0;
                torrent["down"] = 0;
            }
            this.setState({torrent: torrent, loaded: true});
        }).bind(this);

    }

    downloadTorrent(fileName) {
        storage
            .child("torrents/" + fileName)
            .getDownloadURL()
            .then(function (url) {
                window.location = url;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        /*
            http://www.omdbapi.com/?i=tt3896198&apikey=5424b8d1
            https://www.igdb.com/
            https://www.discogs.com/
        */
        return (
            <div className="Torrent">
                {this.state.loaded
                    ? <div>
                            {this.state.torrent.isMovieOrShow
                                ? <MovieShow data={this.state.torrent}/>
                                : null}

                            {this.state.torrent.isMiscellaneous
                                ? <Miscellaneous data={this.state.torrent}/>
                                : null}

                            {this.state.torrent.isMusic
                                ? <Music data={this.state.torrent}/>
                                : null}
                        </div>
                    : null}
            </div>
        );
    }
}

export default Torrent;
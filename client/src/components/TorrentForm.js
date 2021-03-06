import React, {Component} from 'react';
import '../css/TorrentForm.css';
import {fire} from '../firebase.js';
import axios from 'axios';

import bytesToSize from '../components/bytesToSize';

class TorrentForm extends Component {

    constructor(props) {
        super(props);
        // bind once here, better than multiple times in render
        this.categorySelected = this
            .categorySelected
            .bind(this);

        this.saveTorrent = this
            .saveTorrent
            .bind(this);

        this.imdbTitleChanged = this
            .imdbTitleChanged
            .bind(this);

        this.trailerChanged = this
            .trailerChanged
            .bind(this);

        this.igdbChanged = this
            .igdbChanged
            .bind(this);

        this.posterChanged = this
            .posterChanged
            .bind(this);

        this.descriptionChanged = this
            .descriptionChanged
            .bind(this);

        this.discogsChanged = this
            .discogsChanged
            .bind(this);

        this.state = {
            category: "Movie",
            isMovieOrShow: true,
            isGame: false,
            isMusic: false,
            isMiscellaneous: false,
            imdbTitle: "",
            description: "",
            trailer: "",
            igdb: "",
            poster: "",
            saved: false,
            discogsID: ""
        };
    }

    imdbTitleChanged(e) {
        this.setState({imdbTitle: e.target.value});
    }

    igdbChanged(e) {
        this.setState({igdb: e.target.value});
    }

    posterChanged(e) {
        this.setState({poster: e.target.value});
    }

    trailerChanged(e) {
        this.setState({trailer: e.target.value});
    }

    discogsChanged(e) {
        this.setState({discogsID: e.target.value});
    }

    descriptionChanged(e) {
        this.setState({description: e.target.value});
    }

    componentWillUnmount() {
        if (!this.state.saved) {
            fire
                .database()
                .ref('torrents/' + this.props.torrent.infoHash)
                .remove();
        }
    }

    saveTorrent(e) {
        e.preventDefault();
        let url = "";
        
        if(this.state.isMovieOrShow){
            url = `http://www.omdbapi.com/?i=${this.state.imdbTitle}&apikey=5424b8d1`;
        }
        else if(this.state.isMusic){
            url = `https://api.discogs.com/releases/${this.state.discogsID}`;
        }

        if (url !== "") {
            console.log("getting data");
            axios
                .get(url)
                .then(response => {
                    console.log(response.data);
                    this.setState({apiData: response.data, loaded: true});
                    fire
                        .database()
                        .ref('torrents/' + this.props.torrent.infoHash)
                        .update(this.state)
                        .then(() => {
                            this.setState({saved: true});
                            this
                                .props
                                .history
                                .push('/torrent/' + this.props.torrent.infoHash);
                        });
                });
        } else {
            fire
                .database()
                .ref('torrents/' + this.props.torrent.infoHash)
                .update(this.state)
                .then(() => {
                    this.setState({saved: true});
                    this
                        .props
                        .history
                        .push('/torrent/' + this.props.torrent.infoHash)
                });
        }
    }

    categorySelected(event) {
        const categoryName = event.target.value;
        this.setState({category: event.target.value, isMovieOrShow: false, isGame: false, isMusic: false, isMiscellaneous: false});

        if (categoryName === "Movie" || categoryName === "TV Show") {
            this.setState({isMovieOrShow: true});
        } else if (categoryName === "Game") {
            this.setState({isGame: true});
        } else if (categoryName === "Music") {
            this.setState({isMusic: true});
        } else if (categoryName === "Miscellaneous") {
            this.setState({isMiscellaneous: true});
        }
    }
    render() {
        /*
            http://www.omdbapi.com/?i=tt3896198&apikey=5424b8d1
            https://www.igdb.com/
            https://www.discogs.com/
        */
        return (
            <div className="TorrentForm">
                <form className="pure-form pure-form-aligned">
                    <fieldset>
                        <div className="pure-control-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={this.props.torrent.name}
                                className="pure-input-1-2"
                                readOnly/>
                        </div>
                        <div className="pure-control-group">
                            <label>Size</label>
                            <input
                                type="text"
                                value={bytesToSize(this.props.torrent.length) + " in "}
                                readOnly/>
                        </div>
                        <div className="pure-control-group">
                            <label htmlFor="Category">Category</label>
                            <select id="Category" onChange={this.categorySelected}>
                                <option value="Movie">Movie</option>
                                <option value="TV Show">TV Show</option>
                                <option value="Game">Game</option>
                                <option value="Music">Music</option>
                                <option value="Miscellaneous">Miscellaneous</option>
                            </select>
                        </div>

                        {this.state.isMovieOrShow
                            ? <div>
                                    <div className="pure-control-group">
                                        <label htmlFor="IMDB">IMDB</label>
                                        <input
                                            id="IMDB"
                                            type="text"
                                            className="pure-input-1-3"
                                            placeholder="Enter IMDB title (tt3896198)"
                                            onChange={this.imdbTitleChanged}/>
                                        <span>
                                            Information such as Plot, Cover Image, Actors will be pulled automatically</span>
                                    </div>
                                    <div className="pure-control-group">
                                        <label htmlFor="trailer">Trailer</label>
                                        <input
                                            id="Trailer"
                                            type="text"
                                            className="pure-input-1-3"
                                            placeholder="Enter YouTube trailer link https://www.youtube.com/watch?v=89OP78l9oF0"
                                            onChange={this.trailerChanged}/>
                                    </div>
                                </div>
                            : null}

                        {this.state.isGame
                            ? <div className="pure-control-group">
                                    <label htmlFor="IGDB">Search for the movie at IGDB</label>
                                    <input
                                        id="IGDB"
                                        type="text"
                                        className="pure-input-1-3"
                                        placeholder="Start typing"
                                        onChange={this.igdbChanged}/>
                                </div>
                            : null}

                        {this.state.isMusic
                            ? <div>
                                    <div className="pure-control-group">
                                        <label htmlFor="Poster">Poster</label>
                                        <input
                                            id="Poster"
                                            type="url"
                                            className="pure-input-1-3"
                                            placeholder="Enter poster image link"
                                            onChange={this.posterChanged}/>
                                    </div>
                                    <div className="pure-control-group">
                                        <div className="discogsExplain">Enter Discogs Release ID for example
                                            "https://www.discogs.com/Various-Classic-Disco/master/<b>1342601</b>"<input
                                            id="discogs"
                                            type="text"
                                            className="pure-input-1-3"
                                            placeholder="1342601"
                                            onChange={this.discogsChanged}/></div>

                                    </div>
                                </div>
                            : null}

                        {this.state.isMiscellaneous
                            ? <div className="pure-control-group">
                                    <label htmlFor="Poster">Poster</label>
                                    <input
                                        id="Poster"
                                        type="url"
                                        className="pure-input-1-3"
                                        placeholder="Enter poster image link"
                                        onChange={this.posterChanged}/>
                                </div>
                            : null}

                        <div className="pure-control-group">
                            <label htmlFor="Information">Description / Additional Information</label>
                            <textarea
                                id="Information"
                                className="pure-input-1-2"
                                rows="4"
                                placeholder="Add some additional information about the torrent..."
                                onChange={this.descriptionChanged}></textarea>
                        </div>
                        <div className="center">
                            <button
                                className="button-success pure-button"
                                onClick={(e) => this.saveTorrent(e)}>Upload!</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        );
    }
}

export default TorrentForm;
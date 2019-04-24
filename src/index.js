import React from "react";
import ReactDOM from "react-dom";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import { debounce } from "throttle-debounce";

import "./styles.css";

class AutoComplete extends React.Component {
  state = {
    displayresult: false,
    value: "",
    suggestions: [],
    finalresult: {}
  };

  componentWillMount() {
    this.onSuggestionsFetchRequested = debounce(
      500,
      this.onSuggestionsFetchRequested
    );
  }

  renderSuggestion = suggestion => {
    return (
      <div className="result">
        <div>{suggestion.title}</div>
      </div>
    );
  };

  onChange = (event, { newValue }) => {
    this.setState({ value: newValue });
  };

  onSuggestionsFetchRequested = ({ value, displayresult }) => {
    axios
      .get("http://localhost:3000/api/books/suggest", {
        params: {
          text: value
        }
      })
      .then(res => {
        console.log(JSON.stringify(res, 1, 4));
        const results = res.data.text.hits.hits.map(h => h._source);
        this.setState({ suggestions: results });
      })
      .catch(err => {
        console.log(err);
      });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  renderResultofSearch = value => {
    axios
      .get("http://localhost:3000/api/books/search", {
        params: {
          title: value
        }
      })
      .then(res => {
        if (res.data.name.hits.total.value > 0) {
          var results = res.data.name.hits.hits.map(h => h._source);
          console.log(JSON.stringify(results, 1, 4));
          this.setState({ finalresult: results[0], displayresult: false });
        } else {
          this.setState({ finalresult: "", displayresult: false });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  changeDisplay = () => {
    this.setState(prevState => {
      let newstate = prevState;
      newstate.displayresult = true;
    });
  };

  showResults = () => {
    const { bookId, isbn, title, author } = this.state.finalresult;
    return (
      <div style={{ textAlign: "centre" }}>
        <div
          style={{
            display: "inline-block",
            textAlign: "left",
            fontSize: "10px"
          }}
        >
          <h2>{bookId ? `Bookid : ${bookId}` : null}</h2>
          <h2>{isbn ? `ISBN : ${isbn}` : null}</h2>
          <h2>{title ? `Title : ${title}` : null}</h2>
          <h2>{author ? `Author : ${author}` : null}</h2>
        </div>
      </div>
    );
  };

  render() {
    const { value, suggestions, displayresult } = this.state;

    const inputProps = {
      placeholder: "search query",
      value,
      displayresult,
      onChange: this.onChange
    };

    return (
      <div className="App">
        <h1>Book Auto Completion</h1>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={suggestion => {
            this.changeDisplay();
            return suggestion.title;
          }}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
        />
        {/* <button onClick={this.renderResultofSearch(value)}>search</button> */}
        <div>{displayresult ? this.renderResultofSearch(value) : null}</div>
        <div>{this.state.finalresult === {} ? null : this.showResults()}</div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<AutoComplete />, rootElement);

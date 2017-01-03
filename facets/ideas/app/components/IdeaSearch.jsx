import React from "react";
import ReactDOM from "react-dom";
import IdeaList from "./IdeaList";

export default class IdeaSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: (props.search || {}).query || ""
    };
    this.handleQueryChange = this.handleQueryChange.bind(this);
  }

  render() {
    const search = Object.assign({}, this.props.search);
    return (
      <div className="idea-search">
        <input type="text" ref="ideaSearch" value={this.state.query} onChange={this.handleQueryChange} placeholder="Search" />
        <div className="children">
          <IdeaList ideas={search.results || []} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.ideaSearch).focus();
  }

  handleQueryChange(event) {
    this.setState({ query: event.target.value });
    if (event.target.value.trim().length > 0) {
      this.props.actions.searchIdeas(event.target.value);
    } else {
      this.props.actions.clearSearch();
    }
  }

}

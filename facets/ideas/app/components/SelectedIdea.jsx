import React from "react";
import { Link } from "react-router";
import { MenuList, MenuItem, MenuButton, Dropdown } from "react-menu-list"
import moment from "moment";
import IdeaType from "./IdeaType";
import _ from "lodash/core";

export default class SelectedIdea extends React.Component {
  constructor(props) {
    super(props);
    this.renderOptionsMenu = this.renderOptionsMenu.bind(this);
  }

  render() {
    const created = this.props.idea.created || Date.now();
    const sortedChildren = _.sortBy(this.props.relationships, (rel) => rel.idea.created);
    const showType = this.props.idea.parents.length > 0;
    return (
      <div className="idea selected">
        { this.renderParents() }
        <div className="selection">
          <div className="details">
            {showType ? <IdeaType value={this.props.idea.type} /> : null}
            <div className="body">{this.props.idea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
          <div className="options">
            <div className="new-idea-button">＋</div>
            <MenuButton className="options-menu" positionOptions={{hAlign: 'right', position: 'bottom'}} menu={this.renderOptionsMenu()}>☰</MenuButton>
          </div>
        </div>
        <div className="children">
          { this.props.children }
        </div>
      </div>
    ); 
  }

  renderOptionsMenu() {
    return (
      <Dropdown>
        <MenuList>
          <MenuItem><Link to="/" className="button secondary">Edit</Link></MenuItem>
          <MenuItem><Link to="/" className="button alert">Delete</Link></MenuItem>
        </MenuList>
      </Dropdown>
    );
  }

  renderParents() {
    return this.props.idea.parents.map(p => 
      <div className="parents" key={p.id}>
        <Link to={"/idea/" + p.id}>
          <div className="body">{p.body}</div>
        </Link>
      </div>);
  }
}


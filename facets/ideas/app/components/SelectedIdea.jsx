import React from "react";
import { Link } from "react-router";
import { MenuList, MenuItem, MenuButton, Dropdown } from "react-menu-list"
import IdeaType from "./IdeaType";
import IdeaList from "./IdeaList";
import IdeaSubmit from "./IdeaSubmit";
import moment from "moment";
import _ from "lodash/core";

export default class SelectedIdea extends React.Component {
  constructor(props) {
    super(props);
    this.renderSubmitIfActive = this.renderSubmitIfActive.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  render() {
    const { selectedIdea } = this.props;
    const created = selectedIdea.created || Date.now();
    const showType = selectedIdea.parents && selectedIdea.parents.length > 0;
    return (
      <div className="idea selected">
        { this.renderParents(selectedIdea) }
        <div className="selection">
          <div className="details">
            {showType ? <IdeaType value={selectedIdea.type} /> : null}
            <div className="body">{selectedIdea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
          <div className="options">
            <Link to={`/idea/${selectedIdea.id}/new`} className="new-idea-button">＋</Link>
            <MenuButton className="options-menu" positionOptions={{hAlign: 'right', position: 'bottom'}} 
              menu={this.renderOptionsMenu(selectedIdea)}>☰</MenuButton>
          </div>
        </div>
        <div className="children">
          {this.renderSubmitIfActive()}
          <IdeaList ideas={selectedIdea.children} />
        </div>
      </div>
    ); 
  }

  renderSubmitIfActive() {
    if (this.props.routes[this.props.routes.length - 1].path === "new") {
      return <IdeaSubmit onSubmit={this.handleSubmit} onCancel={this.handleCancel} shouldSubmitType={true} />;
    }
  }

  handleSubmit(idea) {
    this.props.actions.submitIdea(idea, this.props.selectedIdea.id, idea.type);
    this.props.router.replace(`/idea/${this.props.selectedIdea.id}`);
  }

  handleCancel(idea) {
    this.props.router.replace(`/idea/${this.props.selectedIdea.id}`);
  }

  renderOptionsMenu(selectedIdea) {
    return (
      <Dropdown>
        <MenuList>
          <MenuItem><Link to={`/idea/${selectedIdea.id}/edit`} className="button secondary">Edit</Link></MenuItem>
          <MenuItem><Link to="/" className="button alert">Delete</Link></MenuItem>
        </MenuList>
      </Dropdown>
    );
  }

  renderParents(selectedIdea) {
    return (selectedIdea.parents || []).map(p => 
      <div className="parents" key={p.id}>
        <Link to={"/idea/" + p.id}>
          <div className="body">{p.body}</div>
        </Link>
      </div>);
  }
}


import React from "react";
import { Link } from "react-router";
import Mousetrap from "mousetrap";
import { MenuList, MenuItem, MenuButton, Dropdown } from "react-menu-list";
import Modal from "react-modal";
import IdeaType from "./IdeaType";
import IdeaList from "./IdeaList";
import IdeaSubmit from "./IdeaSubmit";
import DeleteConfirmModal from "./modals/DeleteConfirm";
import moment from "moment";
import _ from "lodash/core";
import { ROOT_TYPE } from "../constants";

const EDIT = "edit";
const NEW = "new";

export default class SelectedIdea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteModalIsOpen: false
    };
    this.route = this.route.bind(this);
    this.renderSelection = this.renderSelection.bind(this);
    this.renderSubmitNew = this.renderSubmitNew.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.handleCreateSubmitted = this.handleCreateSubmitted.bind(this);
    this.handleEditSubmitted = this.handleEditSubmitted.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.openDeleteConfirmModal = this.openDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.onDeleteConfirmed = this.onDeleteConfirmed.bind(this);
    this.transitionTo = this.transitionTo.bind(this);
    this.transitionToCreateForm = this.transitionToCreateForm.bind(this);
    this.transitionToEditForm = this.transitionToEditForm.bind(this);
  }

  render() {
    const { selectedIdea } = this.props;
    return (
      <div className="idea selected" onKeyPress={this.handleKeyPress}>
        { this.renderParents(selectedIdea) }
        { this.route() === EDIT 
            ? this.renderEditor(selectedIdea) 
            : this.renderSelection(selectedIdea) }
        { this.route() === NEW ? this.renderSubmitNew() : null }
        <DeleteConfirmModal isOpen={this.state.deleteModalIsOpen} idea={selectedIdea}
          closeModal={this.closeDeleteConfirmModal} confirmModal={this.onDeleteConfirmed} />
        <div className="children">
          <IdeaList ideas={selectedIdea.children} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    Mousetrap.bind(['c', 'c', "create new idea"], this.transitionToCreateForm);
    Mousetrap.bind(['e', 'e', "edit idea"], this.transitionToEditForm);
  }

  componentWillUnmount() {
    Mousetrap.unbind(['c', 'c', "create new idea"], this.transitionToCreateForm);
    Mousetrap.unbind(['e', 'e', "edit idea"], this.transitionToEditForm);
  }

  renderSelection(selectedIdea) {
    const created = selectedIdea.created || Date.now();
    return (
      <div className="selection">
        <div className="details">
          <IdeaType value={selectedIdea.type} />
          <div className="body">{selectedIdea.body}</div>
          <div className="created">{moment(created).fromNow()}</div>
        </div>
        <div className="options">
          <a onClick={this.transitionToCreateForm} className="new-idea-button">＋</a>
          <MenuButton className="options-menu" positionOptions={{hAlign: 'right', position: 'bottom'}} 
            menu={this.renderOptionsMenu(selectedIdea)}>☰</MenuButton>
        </div>
      </div>);
  }

  renderParents(selectedIdea) {
    return (selectedIdea.parents || []).map(p => 
      <div className="parents" key={p.id}>
        <Link to={"/idea/" + p.id}>
          <div className="body">{p.body}</div>
        </Link>
      </div>);
  }

  renderSubmitNew() {
    return <IdeaSubmit onSubmit={this.handleCreateSubmitted} onCancel={this.handleCancel} shouldSubmitType={true} />;
  }

  renderEditor(selectedIdea) {
    const submitType = selectedIdea.type !== ROOT_TYPE;
    return <IdeaSubmit onSubmit={this.handleEditSubmitted} onCancel={this.handleCancel} 
      shouldSubmitType={submitType} selectedIdea={selectedIdea} />;
  }

  renderOptionsMenu(selectedIdea) {
    return (
      <Dropdown>
        <MenuList>
          <MenuItem><div onClick={this.transitionToEditForm} className="button secondary">Edit</div></MenuItem>
          <MenuItem><div onClick={this.openDeleteConfirmModal} className="button alert">Delete</div></MenuItem>
        </MenuList>
      </Dropdown>
    );
  }

  route() {
    return this.props.routes[this.props.routes.length - 1].path;
  }

  transitionTo(url) {
    this.props.actions.skipFetch();
    this.props.router.replace(url);
  }

  transitionToCreateForm() {
    this.transitionTo(`/idea/${this.props.selectedIdea.id}/new`);
    return false;
  }

  transitionToEditForm() {
    this.transitionTo(`/idea/${this.props.selectedIdea.id}/edit`);
    return false;
  }

  handleCreateSubmitted(newIdea) {
    this.props.actions.createIdea(newIdea, this.props.selectedIdea.id, newIdea.type);
    this.transitionTo(`/idea/${this.props.selectedIdea.id}`);
  }
  
  handleEditSubmitted(editedIdea) {
    this.props.actions.updateIdea(editedIdea);
    this.transitionTo(`/idea/${this.props.selectedIdea.id}`);
  }

  handleCancel(idea) {
    this.transitionTo(`/idea/${this.props.selectedIdea.id}`);
  }

  openDeleteConfirmModal() {
    this.setState({ deleteModalIsOpen: true });
  }

  closeDeleteConfirmModal() {
    this.setState({ deleteModalIsOpen: false });
  }

  onDeleteConfirmed() {
    const { actions, selectedIdea, router } = this.props;
    this.setState({ deleteModalIsOpen: false });
    actions.deleteIdea(selectedIdea).then(() => {
      // do not call transitionTo; since we are transitioning to a different idea, we want a fetch to happen.
      this.props.router.replace(selectedIdea.parents.length > 0 ? `/idea/${selectedIdea.parents[0].id}` : '/');
    });
  }

}


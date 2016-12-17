import React from "react";
import { Link } from "react-router";
import { MenuList, MenuItem, MenuButton, Dropdown } from "react-menu-list";
import Modal from "react-modal";
import IdeaType from "./IdeaType";
import IdeaList from "./IdeaList";
import IdeaSubmit from "./IdeaSubmit";
import moment from "moment";
import _ from "lodash/core";

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
    this.handleSubmitNew = this.handleSubmitNew.bind(this);
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.confirmDeleteIdea = this.confirmDeleteIdea.bind(this);
    this.openDeleteConfirmModal = this.openDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.renderDeleteConfirmModal = this.renderDeleteConfirmModal.bind(this);
  }

  render() {
    const { selectedIdea } = this.props;
    const showType = selectedIdea.parents && selectedIdea.parents.length > 0;
    return (
      <div className="idea selected">
        { this.renderParents(selectedIdea) }
        { this.route() === EDIT 
            ? this.renderEditor(selectedIdea, showType) 
            : this.renderSelection(selectedIdea, showType) }
        { this.route() === NEW ? this.renderSubmitNew() : null }
        { this.renderDeleteConfirmModal() }
        <div className="children">
          <IdeaList ideas={selectedIdea.children} />
        </div>
      </div>
    ); 
  }

  route() {
    return this.props.routes[this.props.routes.length - 1].path;
  }

  renderSelection(selectedIdea, showType) {
    const created = selectedIdea.created || Date.now();
    return (
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
      </div>);
  }

  renderSubmitNew() {
    return <IdeaSubmit onSubmit={this.handleSubmitNew} onCancel={this.handleCancel} shouldSubmitType={true} />;
  }

  renderEditor(selectedIdea, showType) {
    return <IdeaSubmit onSubmit={this.handleSubmitEdit} onCancel={this.handleCancel} 
      shouldSubmitType={showType} selectedIdea={selectedIdea} />;
  }

  handleSubmitNew(newIdea) {
    this.props.actions.submitIdea(newIdea, this.props.selectedIdea.id, newIdea.type);
    this.props.router.replace(`/idea/${this.props.selectedIdea.id}`);
  }
  
  handleSubmitEdit(editedIdea) {
    this.props.actions.updateIdea(editedIdea);
    this.props.router.replace(`/idea/${this.props.selectedIdea.id}`);
  }

  handleCancel(idea) {
    this.props.router.replace(`/idea/${this.props.selectedIdea.id}`);
  }

  confirmDeleteIdea() {
    this.openDeleteConfirmModal();
  }

  openDeleteConfirmModal() {
    this.setState({ deleteModalIsOpen: true });
  }

  closeDeleteConfirmModal() {
    this.setState({ deleteModalIsOpen: false });
  }

  renderDeleteConfirmModal() {
    return (
      <Modal
        contentLabel="Confirm idea deletion" 
        isOpen={this.state.deleteModalIsOpen} 
        onRequestClose={this.closeDeleteConfirmModal}
      >
        <div>Are you sure you want to delete this idea</div>
        <button onClick={this.closeDeleteConfirmModal} className="button">Cancel</button>
      </Modal>
    );
  }

  renderOptionsMenu(selectedIdea) {
    return (
      <Dropdown>
        <MenuList>
          <MenuItem><Link to={`/idea/${selectedIdea.id}/edit`} className="button secondary">Edit</Link></MenuItem>
          <MenuItem><div onClick={this.confirmDeleteIdea} className="button alert">Delete</div></MenuItem>
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


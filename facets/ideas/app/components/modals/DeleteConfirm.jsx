import React from "react";
import Modal from "react-modal";
import Idea from "../Idea";

function modalStyle(showWarning) {
  return {
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderRadius: 0
    },
    content: {
      position: 'fixed',
      left: '50%',
      top: '15%',
      right: 'auto',
      bottom: 'auto',
      maxWidth: '600px',
      width: '80%',
      transform: 'translate(-50%, -15%)',
      maxHeight: 'calc(100%-100px)',
      borderRadius: 0,
      border: 0,
      padding: '0'
    }
  }
}

export default class DeleteConfirm extends React.Component {
  render() {
    const children = this.props.idea.children;
    return (
      <Modal contentLabel="Confirm Idea Deletion" 
      isOpen={this.props.isOpen} onRequestClose={this.props.closeModal} style={modalStyle(children.length > 0)}>
        <div className="delete-confirm-modal">
          <div className="title">Confirm Idea Deletion</div>
          <div className="question">Delete this idea?</div>
          <Idea idea={this.props.idea} />
          { children.length > 0 
            ? <div className="warning"><span>Warning</span>: This idea has {children.length} children that will be orphaned</div>
            : null }
          <div className="buttons">
            <button onClick={this.props.confirmModal} className="button alert">Delete</button>
            <button onClick={this.props.closeModal} className="button">Cancel</button>
          </div>
        </div>
      </Modal>
    );
  }
}


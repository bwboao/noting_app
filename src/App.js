import React from 'react'
import logo from './logo.svg';
import './App.css';
import Note from './note/note'
import ToDoList from './todo/todolist';
import Journal from './journal/journal';

import { ReactComponent as NoteButton } from './note.svg'
import journalbutton from './journal.svg'
const electron = window.require("electron")

function MenuBar(props) {
  return(
    <div className="Menu-left"> 
      <button name="note" 
        className="note-button button"
        onClick={props.handleNote}
      >
        <NoteButton/>
      </button>
      <button 
        name="journal" 
        className="journal-button button"
        onClick={props.handleJournal}
      >
        <img alt="journal" src={journalbutton}/>
      </button>
    </div>
  )
}


class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentPage: "note",
    };
  }

  handleJournal(){
    this.setState({
      currentPage: "journal"
    })
  }

  handleNote(){
    this.setState({
      currentPage: "note"
    })
  }

  render(){
    
    let currentPage = <Note/>;
    if(this.state.currentPage === "journal")
      currentPage = <Journal/>;
    return (
      <div className="App">
      <div className="App-container">
        <MenuBar
          handleNote={()=>this.handleNote()}
          handleJournal={()=>this.handleJournal()}
        />
      {/* <header className="App-header"></header> */}
        {currentPage}
        <ToDoList/>
      </div>
    </div>
    );
  }
}


export default App;

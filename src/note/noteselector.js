import { ipcRenderer } from 'electron';
import React from 'react';
import './noteselector.css'
// const  fs = require('fs')
// const electron = window.require("electron");


class NoteList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            count: 0,
        };
    }
    
    render(){
        // const dir = app.getAppPath("UserData");
        const dir = ipcRenderer.sendSync('getpath', 'pls work', 'more args?')
        // const dir = "hi"
        // const notelist = window.notelist;
        const notelist = ipcRenderer.sendSync('getList','note')
        console.log(notelist,typeof(notelist),notelist.length)
        if(notelist === "fail"){
            notelist = [];
        }

        const listdata = notelist.map((note, index) =>{
            if(note.type ==="total") return;
            return(
                <li key={note.id}>
                    <button
                        className="note-list-button" 
                        onClick={() => this.props.handleClickNote(note.id)}
                    >
                        {index}.{note.filename}
                        <div className="note-brief">
                            <span>{note.brief}</span>
                        </div>
                    </button>
                </li>
            );
        })

        if (notelist.length === 0){
            return(
                <div>
                    <span>No notes created</span>
                </div>
            )
        }else{
            return(
                <div>
                    <ul className="note-list">
                        {listdata}
                    </ul>
                </div>
            )
        }
    }
}

class NoteSelector extends React.Component{
    render(){
        return(
            <div className="container">
                <NoteList
                    handleClickNote = {(i) => this.props.handleClickNote(i)}
                />
            </div>
        )
    }
}

export default NoteSelector
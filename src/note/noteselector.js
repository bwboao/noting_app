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

    handleRightClick(e,filename){
        // fires when the file is right-clicked
        console.log(e);
        // send ipc to main to show menu (electron_)
        let obj = ["note",filename]
        ipcRenderer.sendSync("context-menu-note",obj);
        // refresh by calling upper element to refresh
        // this.props.getNewNotelist();
        console.log(this.state.count)
        let count = ipcRenderer.sendSync('getList','note').length
        this.setState({
            count: count
        })
        console.log(this.state.count)
    }
    
    render(){
        console.log("props:",this.props)
        // const dir = app.getAppPath("UserData");
        // const dir = ipcRenderer.sendSync('getpath', 'pls work', 'more args?')
        // const dir = "hi"
        // const notelist = window.notelist;
        const notelist = ipcRenderer.sendSync('getList','note')
        // let notelist = this.props.notelist;
        // console.log(notelist,typeof(notelist),notelist.length)
        if(notelist === "fail"){
            notelist = [];
        }
        // sort the list by modified date
        notelist.sort((a,b)=>{
            return b.lastModifiedDate - a.lastModifiedDate;
        })
        console.log("sorted:",notelist)
        let fileclicked = "";
        const listdata = notelist.map((note, index) =>{
            if(note.type ==="total") return;
            if(note.id === this.props.fileclicked){
                fileclicked = "";
                console.log(note.id,"clicked");
            }else{
                fileclicked = ""
            }
            return(
                <li key={note.id}>
                    <button
                        className={"note-list-button"+" "+fileclicked} 
                        onClick={() => this.props.handleClickNote(note.id)}
                        onContextMenu={(e)=> this.handleRightClick(e,note.id)}
                    >
                        {note.filename}
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
                    notelist={this.props.notelist}
                    fileclicked={this.props.fileclicked}
                    getNewNotelist={()=> this.props.getNewNotelist()}
                />
            </div>
        )
    }
}

export default NoteSelector
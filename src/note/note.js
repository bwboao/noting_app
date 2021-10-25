import React from 'react';
import NoteSelector from './noteselector'
import Editor from '../editor/editor'
import './note.css'
import { ipcRenderer } from 'electron';

class Note extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          createNote: false,
          createFolder: false,
          fileclicked: "",
          notelist: "",
          filestatus: "",
        };
      }
    
    getNewNotelist(){
        const notelist = ipcRenderer.sendSync("getList","note")
        this.setState({
            notelist: notelist,
            filestatus: "delete",
        })
    }

    handleCreateNote(){
        console.log("create note!")
        let filevalue = {
            id: Date.now(),
            filename: "",
            value: "",
            folder: null,
        }
        // [type,filename,value]
        let obj = ["note",filevalue]
        // console.log(obj)
        const filestatus = ipcRenderer.sendSync("newFile",obj);
        // console.log("status",filestatus)
        this.getNewNotelist(filestatus)
    }

    handleCreateFolder(){
        console.log("create folder!")
    }

    handleClickNote(notename){
        console.log(notename,"is clicked")
        this.setState({
            createNote: false,
            createFolder: false,
            fileclicked: notename 
        })
    }

    render(){
        return(
            <div className="note-area">
                <div className="note-selector-container">
                    <div className="note-bar">
                        <span className="note-title">Notes</span>
                        <div className="note-create-buttons">
                            <button className="create-note"
                                onClick={()=>this.handleCreateNote()}
                            >crno</button>
                            <button className="create-folder"
                                onClick={()=>this.handleCreateFolder()}
                            >crfd</button>
                        </div>
                    </div>
                    <NoteSelector
                        handleClickNote={(i) => this.handleClickNote(i)}
                        notelist={this.state.notelist}
                        fileclicked={this.state.fileclicked}
                        getNewNotelist={()=> this.getNewNotelist()}
                    />
                </div>
                <div className="editor-container">
                    <Editor
                        file={this.state.fileclicked}
                        type="note"
                        folder={null}
                    />
                </div>
            </div>
        )
    }
}

export default Note;
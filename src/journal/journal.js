import React from 'react'
import './journal.css'
import Editor from '../editor/editor';
// import { findRenderedDOMComponentWithClass } from 'react-dom/cjs/react-dom-test-utils.production.min';
import { ipcRenderer } from 'electron';

function JournalBrief(props){
    return(
        <div></div>
    )
}


class JournalSelector extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            notes: [],
            // notes: [{
            //     id: "create",
            //     date: Date.now(),
            //     brief: "brief",
            //     title: "hi"
            // },{
            //     id: "created",
            //     date: Date.now() - 86400000,
            //     brief: "brief2",
            //     title: "hi2"
            // }],
        }
    }

    daysAgo(today,daysago){
        let xdaysago = new Date(today)
        xdaysago.setDate(new Date(today).getDate() - daysago);
        xdaysago.setHours(0,0,0);
        // console.log(today,Date(today),xdaysago);
        return xdaysago.getTime();
    }

    readnote(notelist){
        // get the note that is in seven days
        // if there is no journal that day create an empty object for reading
        // console.log('readnote',notelist,notelist.length);
        let today = Date.now();
        let journallist = [];
        let j = notelist.length - 1;
        for(let i=0;i<7;i++){
            console.log("i,today",i,this.daysAgo(today,i),Date(this.daysAgo(today,i)));
            journallist[i] = [];
            for(;j>0;j--){
                console.log("i,j,journallist,notelist[j]",i,j,journallist,notelist[j]);
                if(notelist[j].id<this.daysAgo(today,i)) break;
                journallist[i] = journallist[i].concat([notelist[j]]);
            }
        }
        console.log(journallist);
        return journallist;
    }

    createJournal(){
        // create note
        console.log("create journal!")
        let id = Date.now()
        let filevalue = {
            id: id,
            filename: "",
            value: "",
            folder: null,
        }
        // [type,filename,value]
        let obj = ["journal",filevalue]
        console.log(obj)
        const filestatus = ipcRenderer.sendSync("newFile",obj);
        console.log("status",filestatus)
        // set the state to renew the editor
        this.props.handleClickBrief(id);
    }

    render(){
        let notelist = ipcRenderer.sendSync('getList','journal');
        // console.log(notelist);
        let journallist = this.readnote(notelist);
        let journalcount= 0,emptyjournal = 0;
        journallist.forEach( (journal) => {
            if(journal.length===0){
                emptyjournal+=1;
            }else{
                journalcount+=journal.length;
            }
        });
        // const linestyle = "calc("+(30*7+84*journalcount)+"px + "+emptyjournal+"em)"
        // console.log(journalcount,linestyle);
        let notes = null;
        const today = Date.now();
        notes = journallist.map((notes,index) =>{
            if(notes===null) return;
            let daynotes = notes.map((note) =>{
                return(
                    <div className="journal-brief"
                        onClick={()=>this.props.handleClickBrief(note.id)}
                        key={note.id}>
                        <div>{note.filename}</div>
                        <div>{note.brief}</div>
                    </div>
                )
            });
            console.log(index,daynotes,daynotes.length);
            if(index === 0 && daynotes.length === 0){
                daynotes = <button className="add-journal"
                                onClick={() => this.createJournal()}
                            >
                                +
                            </button>
            }
            let date = new Date(this.daysAgo(today,index))
            let notedate = (date.getMonth() + 1) + "/" + date.getDate();
            // console.log(notedate,date.toLocaleDateString())
            return(
                <div className="journal-brief-container" 
                    key={date}
                    // onClick={() => this.props.handleClickBrief(note.date)}
                >
                    <div className="journal-daynotes-container">
                        {daynotes}     
                    </div>
                    <div className="journal-date">
                        <span>{notedate}</span>
                    </div>
                    <div className="journal-line">
                        <div className="journal-circle"/>
                        <div className={`journal-circle-line ${index}`}
                            style={(index === 0)
                                    ?{height: "calc("+(30*7+84*journalcount)+"px + "+emptyjournal+"em)"}
                                    :{height: "0px"}}/>
                    </div>
                </div>
            )
        })

        return(
            <div className="journal-selector-container">
                <span className="journal-title">Journal</span>
                {notes}
            </div>
        )
    }
}


class Journal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selected: null,
        }
    }
    handleClickBrief(filename){
        // if the file exisits
        console.log(filename);
        this.setState({
            selected: filename,
        })
    }

    render(){
        let editpart = null;
        if(this.state.selected === null){
            editpart = <div className="editor-add-new-today">
               <button> + </button>
            </div>
        }else{
            editpart = <Editor
                            file = {this.state.selected}
                            type = "journal"
                            folder = {null}
                        />
        }

        return(
            <div className="journal-container">
                <JournalSelector
                    handleClickBrief={(e) => this.handleClickBrief(e)}
                />
                <div className="editor-container">
                    {editpart}
                </div>
            </div>
        )
    }
}

export default Journal;
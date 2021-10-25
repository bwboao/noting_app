import React from 'react'
import './journal.css'
import Editor from '../editor/editor';
// import { findRenderedDOMComponentWithClass } from 'react-dom/cjs/react-dom-test-utils.production.min';
import { ipcRenderer } from 'electron';

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
            showDays: 7,
            noMore: false,
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
        // get the note that is in seven days (adds 7 per time by user)
        // if there is no journal that day create an empty object for reading
        // console.log('readnote',notelist,notelist.length);
        let today = Date.now();
        let journallist = [];
        let j = notelist.length - 1;
        let dayshow = this.state.showDays;
        for(let i=0;i<dayshow;i++){
            // console.log("i,today",i,this.daysAgo(today,i),Date(this.daysAgo(today,i)));
            journallist[i] = [];
            for(;j>0;j--){
                // console.log("i,j,journallist,notelist[j]",i,j,journallist,notelist[j]);
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

    showMoreJournal(){
        // console.log("show 7 days more journal");
        let dayshow = this.state.showDays;
        this.setState({
            showDays: dayshow+7
        })
    }

    render(){
        let notelist = ipcRenderer.sendSync('getList','journal');
        // console.log(notelist);
        let journallist = this.readnote(notelist);
        let journalcount= 0,emptyjournal = 0,notecount=0,length=0;
        journallist.forEach( (journal) => {
            if(journal.length===0){
                emptyjournal+=1;
            }else{
                journalcount+=1;
                notecount += journal.length
            }
        });
        // const linestyle = "calc("+(30*7+84*journalcount)+"px + "+emptyjournal+"em)"
        // console.log(journalcount,linestyle);
        let notes = null;
        const today = Date.now();
        notes = journallist.map((notes,index) =>{
            if(notes===null || ( index!==0 && notes.length === 0)) return null;
            let daynotes = notes.map((note) =>{
                return(
                    <div className="journal-brief"
                        onClick={()=>this.props.handleClickBrief(note.id)}
                        key={note.id}>
                        <div className="journal-brief-title">{note.filename}</div>
                        <div className="journal-brief-brief">{note.brief}</div>
                    </div>
                )
            });
            // console.log(index,daynotes,daynotes.length);
            if(index === 0 ){
                // for correct line length
                // notecount -=  daynotes.length/2 ;
                // if today doesn't have journal show add button
                if(daynotes.length === 0){
                    length = (30*journalcount+84*notecount)
                    daynotes = <button className="add-journal"
                                onClick={() => this.createJournal()}
                            >
                                +
                            </button>
                }else{
                    length = (30*journalcount+84*(notecount - daynotes.length/2))
                }
            }
            let date = new Date(this.daysAgo(today,index))
            let notedate = (date.getMonth() + 1) + "/" + date.getDate();
            // console.log(notedate,date.toLocaleDateString())
            console.log("length:",journalcount,notecount,length);
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
                                    ?{height: length+"px"}
                                    :{height: "0px"}}/>
                    </div>
                </div>
            )
        })
        // console.log("notes:",notecount===notelist.length - 1,notecount,notelist.length - 1)
        return(
            <div className="journal-selector-container">
                <span className="journal-title">Journal</span>
                <div className="journal-notes-container">
                    {notes}
                </div>
                {notecount===notelist.length - 1? null: (<button
                    className="journal-more-btn"
                    onClick={()=>this.showMoreJournal()}
                    >show more...</button>)}
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
        this.handleClickBrief(id);
    }

    render(){
        let editpart = null;
        if(this.state.selected === null){
            editpart = <div className="editor-add-new-today">
               <button 
                onClick={() => this.createJournal()}
               > + </button>
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
import React, { useEffect } from 'react';
import './editor.css';
import { ipcRenderer } from 'electron';
// use stackoverflow editor instead of plain textarea
// import { StacksEditor } from "@stackoverflow/stacks-editor";
// import "@stackoverflow/stacks-editor/dist/styles.css";
import Tiptap from './tiptap';

// function StkEditor(){
//     useEffect(()=>{
//         console.log(document.querySelector("#stack-editor"))
//         new StacksEditor(
//             // this.editorRef.current,
//             document.querySelector("#stack-editor"),
//             "test if working",
//             {}
//         );
//     },[])

//     return(
//         <textarea 
//         id="stack-editor"
//         // ref={this.editorRef}
//     />
//     );
// }


class Editor extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value : "",
            date: "",
            title: "",
            file: this.props.file,
        }
        // this.editorRef = React.createRef();
    }
    componentDidMount(){
        console.log(this.props);
        this.resetTheValue(this.props.file)
        // console.log(this.state.file)

    }
    shouldComponentUpdate(nextProps){
        console.log("should?",nextProps.file,this.props.file)
        if(nextProps.file !== this.props.file){
            // this.setState({
            //     file: this.props.file
            // })
            this.resetTheValue(nextProps.file);
        }
        return true
    }
    // same as onchange in react
    handleInput(e){
        // console.log("input",e)
        this.setState({
            value: e.target.value
        })
    }
    handleOnBlur(e){
        // If nothing is changed don't save
        if(this.state.value === this.state.resetvalue) return;
        //Save at onblur
        // something call electron to save
        console.log("saving",e,this.props.file,this.props.type);
        const value = this.state.value;
        console.log("title = ",value.split("\n")[0].substring(0,20))
        let filevalue = {
            id: this.props.file,
            filename: value.split("\n")[0].substring(0,20),
            value: value,
            folder: this.props.folder,
        }
        // [type,filename,value]
        let obj = [this.props.type,filevalue]
        console.log(obj)
        const filestatus = ipcRenderer.sendSync("saveFile",obj);
        console.log("status",filestatus)
    }
    resetTheValue(filename){
        console.log("reset")
        // read the file since filename has changed
        if(filename === null || filename === "") return;
        let obj = [this.props.type,filename];
        let [status,filevalue] = ipcRenderer.sendSync('readFile',obj);
        console.log("read file status",status,filevalue);
        if(status==="read file fail" || filevalue === undefined) return;
        this.setState({
            file: filename,
            value: filevalue.value,
            resetvalue: filevalue.value,
        })
    }
    render(){
        return(
            <div className="editor-component-container">
                {/* <span>file: {this.props.file}</span> */}
                {/* <textarea
                    key={this.props.file}
                    onInput={(e)=>this.handleInput(e)}
                    onBlur={(e)=>this.handleOnBlur(e)}
                    autoComplete="off"
                    autoCorrect="false"
                    spellCheck="false"
                    className="note-textarea"
                    name="currentnote"
                    
                    value={this.state.value}
                    /> */}

            <Tiptap
                key={this.state.file}
                file={this.state.file}
                content={this.state.value}
                type={this.props.type}
                folder={this.props.folder}
            />
            </div>
        )
    }
}



export default Editor;


// For a better implement use @tiptap
// https://www.tiptap.dev/installation/react
import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from "@tiptap/core";
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import lowlight from 'lowlight';
import Typography from '@tiptap/extension-typography';
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import './tiptap.css'
import { ipcRenderer } from 'electron';
import KatexExtension from "./ketaxExtension";

function parseBrief(value){
    const splitedpart = value.split("\n")
    if(splitedpart.length === 1){
        return "No content added";
    }else{
        // try until there is something
        for(let i=1;i<splitedpart.length;i++){
            if(splitedpart[i].length > 0){
                // return the first 20 characters
                return value.split("\n")[i].substring(0,20);
            }
        }
        // if there is all blank string return a blank string for showing correct brief
        return "\n";
    }    
}

function Tiptap(props) {
    const [updateCount, setUpdate] = useState(0);
    const CustomExtension = Extension.create({
        onBlur(e){
            const content = this.editor.getJSON();
            // If nothing is changed don't save
            // Save at onblur
            // something call electron to save
            console.log("saving",e,props.file,props.type);
            let value = this.editor.getText();
            console.log("title = ",value.split("\n")[0].substring(0,20))
            let filevalue = {
                id: props.file,
                filename: value.split("\n")[0].substring(0,20),
                value: content,
                folder: props.folder,
                brief: parseBrief(value),
            }
            // [type,filename,value]
            let obj = [props.type,filevalue]
            console.log(obj)
            const filestatus = ipcRenderer.sendSync("saveFile",obj);
            console.log("status",filestatus)
        }
    })
    useEffect((e)=>{
        // save after 50 changes(moves)
        console.log("check updateCount",updateCount);
        if(updateCount > 50){
            const content = editor.getJSON();
            console.log("auto saving-50",e,props.file,props.type);
            let value = editor.getText();
            console.log("title = ",value.split("\n")[0].substring(0,20))
            let filevalue = {
                id: props.file,
                filename: value.split("\n")[0].substring(0,20),
                value: content,
                folder: props.folder,
                brief: parseBrief(value),
            }
            // [type,filename,value]
            let obj = [props.type,filevalue]
            console.log(obj)
            const filestatus = ipcRenderer.sendSync("saveFile",obj);
            console.log("status",filestatus)
            setUpdate(0);
        }
    },[updateCount])
    // console.log(props.content)
    // let obj = [props.type,props.file];
    // let value;
    // let [status,filevalue] = ipcRenderer.sendSync('readFile',obj);
    // console.log("read file status",status,filevalue);
    // if(status==="read fail" || filevalue === null) value = "read file fail";
    // else value = filevalue.value;
    const editor = useEditor({
        extensions: [
        StarterKit.configure({
            // for not duplicating with codeBlockLowLight
            codeBlock: false,
        }),
        Highlight,
        Typography,
        CodeBlockLowlight.configure({
            lowlight,
            //   languageClassPrefix: 'language-',
        }),
        CustomExtension,
        KatexExtension,
        Link.extend({
            addKeyboardShortcuts(){
                return{
                    'Mod-k': (e)=> {
                        console.log("mod-k",e,window.getSelection()); 
                        this.editor.commands.toggleLink(
                            {href: window.getSelection().focusNode.data,
                            target: '_blank'})
                    },
                    'Mod-s': (e)=>{
                        const content = this.editor.getJSON();
                        console.log("auto saving-50",e,props.file,props.type);
                        let value = this.editor.getText();
                        console.log("title = ",value.split("\n")[0].substring(0,20))
                        let filevalue = {
                            id: props.file,
                            filename: value.split("\n")[0].substring(0,20),
                            value: content,
                            folder: props.folder,
                            brief: parseBrief(value),
                        }
                        // [type,filename,value]
                        let obj = [props.type,filevalue]
                        console.log(obj)
                        const filestatus = ipcRenderer.sendSync("saveFile",obj);
                        console.log("status",filestatus)
                    }
                }
            }
        })
        ],
        content: props.content,
        editorProps:{
            attributes:{
                spellcheck: 'false',
            }
        },
        onUpdate(e){
            // setUpdate(updateCount+1);
            setUpdate(updateCount => updateCount+1);
        }
  })

//   console.log(props,file)
// //   debug
//   if(props.file != file){
//       console.log("file changed!!!");
//       setFile(props.file);
//   }

  return (
    <div className="tiptap">
        <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap;
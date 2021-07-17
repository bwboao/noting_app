import React from 'react';
import './todolist.css'

class ToDoItem extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            inputvalue: "",
            copy: false,
        }

        this.inputRef = React.createRef();
        this.composition = false;
        this.handlePaste = this.handlePaste.bind(this);
    }

    handlePaste(e){
        e.preventDefault();
        // console.log(this.state)
        // actually just change the clipboard data
        // console.log((e.clipboardData || window.clipboardData).getData('text'));
        // console.log(paste,typeof(paste));
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        document.execCommand('insertText',false,paste);

        /*USING THE CLIPBOARD IS A PAIN TO HANDLE INPUT BESIDES USING document.execComand */
        // (e.clipboardData || window.clipboardData).setData("text",paste);
        // const originvalue = this.state.inputvalue;
        // console.log(paste,typeof(paste),originvalue);
        // console.log(originvalue.concat(paste));
        // console.log((e.clipboardData || window.clipboardData).getData('html'));
        // this.setState({
        //     copy: !this.state.copy
        // })
        // e.target.paste()
    }

    // prevent the component from updating every input
    // shouldComponentUpdate(nextProps, nextState){
    //     console.log("should Component Update? see:",
    //                         nextProps,
    //                         nextState,
    //                         this)
    //     const inputRef = this.inputRef.current;
    //     return nextState.inputvalue !== inputRef.outerText;//|| nextState.copy !== this.state.copy;
    // }

    // manually focus if needed
    componentDidMount(){
        //https://stackoverflow.com/questions/6249095/how-to-set-caretcursor-position-in-contenteditable-element-div
        // if want to set to the last need to set Range asnd Selection
        if(this.props.focus){
            let range = document.createRange();
            let selection = document.getSelection();
            
            // range.setStart(this.inputRef.current);
            range.selectNodeContents(this.inputRef.current);
            range.collapse(false);
            
            selection.removeAllRanges()
            selection.addRange(range);
            
            this.inputRef.current.focus();
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event
    // When typing chinese reading the <Enter> key will break the app
    handleCompositionStart(){
        this.composition = true;
    }

    handleCompositionEnd(){
        this.composition = false;
    }

    handleToDoInput(e){
        // console.log(this.state)
        // handle every time the user type (React seems to have same behavior on
        // onInput and onChange for input), ContentEditable component doesn't support
        // onChange see:https://github.com/facebook/react/issues/278
        // console.log(e.target.outerText);
        // if there is input add to the value
        this.setState({
            inputvalue: e.target.outerText
        })
    }

    handleToDoKeyDown(e){
        // console.log(e)
        // if enter is pressed created new and focus on that
        // if chines is still typing (not finished by pressing <Enter> <Space>...)
        // use key for both numpadEnter and Enter
        if(!this.composition && e.key === "Enter"){
            console.log("Pressed enter!!",e)
            // catch the enter to not return
            e.preventDefault()
            if(e.target.outerText === null){
                //do nothing
            }else{
                if(this.props.checkbox){
                        this.props.handleCreateNext(this.props.id)
                    // should create a new one just below
                }else{
                    // create with focus
                    e.focus = true;
                    this.props.handleToDoBlur(e,true)
                
                }
            }
        }
    }
    handleToDoBlur(e){
        //if this is create add the value to list if not just stay calm
        // this.setState({
        //     inputvalue: "no",
        // })
        // console.log(this.state,"renew",this.props.renew)
        if(!this.props.checkbox)
            // create with no focus
            this.props.handleToDoBlur(e,false);
    }

    render(){

        let itemcheck;
        if(this.props.checkbox === true){
            itemcheck = <input 
            type="checkbox" 
            id="check"
            className="todo-checkbox"
            ></input>
        } else{
            itemcheck = <div className="plus-icon todo-add">╋</div>
        }

        const deleteBtn = this.props.checkbox 
            ? <button
                onClick={this.props.handleDeleteToDoItem}
                className="todo-item-delete-btn"
              >X</button>
            : null;
        const html = (this.state.inputvalue || this.props.value);
        
        return(
            <div className="todo-item" >
                {itemcheck}
                <div className="todo-item-label">
                    {/* <label onClick={props.handleClickLabel}>Sth to do</label> */}
                    <div 
                        type="text"
                        contentEditable="true"
                        className="todo-item-input"
                        // use CSS to attend the place holder
                        placeholder={this.props.placeholder}
                        value={this.props.renew}
                        onChange={(e) => this.handleToDoInput(e)}
                        onBlur={(e) => this.handleToDoBlur(e)}
                        onKeyDown={(e) => this.handleToDoKeyDown(e)}
                        onPaste={this.handlePaste}
                        autoComplete="off"
                        spellCheck="false"
                        wrap="soft"
                        suppressContentEditableWarning={true}
                        // autoFocus={true}
                        ref={this.inputRef}
                        onCompositionStart={() => this.handleCompositionStart()}
                        onCompositionEnd={() => this.handleCompositionEnd()}
                        // dangerouslySetInnerHTML={{__html: html}}
                        > 
                    {this.props.value}
                    </div>
                </div>
                {deleteBtn}
            </div>
        )
    }
}

class SubList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            itemsTodo: [{
                id: "create",
                value: "",
                checked: "no",
                focus: false,
            }],
            itemsDone: [],
            renew: true,
        }
    }

    handleClickLabel(e){
        // aftering clikcing label replace the label with an input
        console.log(this);
        console.log(e);
        // const todoinput = <input type="text" onChange={(e) => this.handleToDoInput(e)}></input>
        // e.target.next
        // e.target.after({todoinput})
        // console.log({todoinput})
        // e.target.remove()
    }
 
    handleToDoBlur(e,focus){
        //should handle on blur and <Enter> but haven't
        // clear the 
        // setSate after finishing the todo
        const itemsTodo = this.state.itemsTodo.slice();
        const itemid = Date.now();
        console.log("blur focus:",e,focus)
        this.setState({
            itemsTodo: itemsTodo.concat([{
                id: itemid,
                value: e.target.outerText,
                checked: "no",
                focus: focus,
            }]),
            renew: !this.state.renew,
        })
    }
    handleCreateNext(itemid){
        //handle <Enter> and create a new one with no content
        // find the current and insert next
        let itemsTodo = this.state.itemsTodo.slice();
        // console.log(itemsTodo.findIndex(this.isIdSame,itemid));
        let pos = itemsTodo.findIndex(this.isIdSame,itemid);
        const removedid = itemsTodo.splice(pos+1,0,{
            id: Date.now(),
            value: "",
            checked: "no",
            focus: true,
        });
        console.log(pos,"removed",removedid);
        this.setState({
            itemsTodo: itemsTodo,
            renew: !this.state.renew,
        })
    }

    isIdSame(item){
        // console.log(item.id,this,item.id === this,item.id == this)
        return item.id === this;
    }

    handleDeleteToDoItem(id){
        const itemid = id;
        let itemsTodo = this.state.itemsTodo.slice();
        // console.log(itemsTodo.findIndex(this.isIdSame,itemid));
        let pos = itemsTodo.findIndex(this.isIdSame,itemid);
        const removedid = itemsTodo.splice(pos,1);
        console.log(pos,"removed",removedid);
        this.setState({
            itemsTodo: itemsTodo,
        })
    }

    render(){
        // console.log("this is id",this.props.listid,"my delete handle is",this.props.handleDeleteToDo)

        const itemsTodo = this.state.itemsTodo.slice();
        let todoitems
        if(itemsTodo.length === 0){
            todoitems = null
        }else{
            todoitems = itemsTodo.map((item,index) =>{
                // console.log(item);
                if(item.id === "create") return null;
                return(
                <ToDoItem
                    key={item.id}
                    id={item.id}
                    value={item.value}
                    handleClickLabel={(e) => this.handleClickLabel(e)}
                    handleToDoBlur={(e,f) => this.handleToDoBlur(e,f)}
                    handleDeleteToDoItem={()=>this.handleDeleteToDoItem(item.id)}
                    handleCreateNext={(e)=>this.handleCreateNext(e)}
                    placeholder="..."
                    checkbox={true}
                    focus={item.focus}
                />)
            });
        }
        // const todoitems = itemsTodo.map((item,index) =>{
        //     return(
        //         <ToDoItem
        //             key={item.id}
        //             value={item.value}
        //             handleClickLabel={(e) => this.handleClickLabel(e)}
        //             handleToDoBlur={(e) => this.handleToDoBlur(e)}
        //             placeholder="..."
        //             checkbox={true}
        //         />
        //     )
        // })


        return(
            <div className="sublist">
                <div className="sublist-header">
                    <span>To do</span>
                    <button 
                        className="delete-sublist-btn"
                        onClick={this.props.handleDeleteToDo}
                    >
                        x
                    </button>
                </div>
                {todoitems}
                <ToDoItem
                    key={"add"+this.state.renew}
                    handleClickLabel={(e) => this.handleClickLabel(e)}
                    handleToDoBlur={(e,f) => this.handleToDoBlur(e,f)}
                    placeholder="Add sth to the list..."
                    checkbox={false}
                    renew={this.state.renew}
                />
            </div>
        )
    }
}


class ToDoList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            count : 0,
            idlist : [],
        };
    }
    
    handleCreateToDo(){
        // use the time created as id
        const listid = Date.now();
        const idlist = this.state.idlist.slice()
        this.setState({
            count: this.state.count + 1,
            idlist: idlist.concat([listid])
        });
        console.log("clicked",listid);
    }

    handleDeleteToDo(id){
        const idlist = this.state.idlist.slice()
        let pos = idlist.indexOf(id)
        const removedid = idlist.splice(pos,1)
        this.setState({
            count: this.state.count - 1,
            idlist: idlist
        });
        console.log("deleted",id,idlist,removedid);
    }

    render(){
        // console.log(this.state,typeof(this.state.idlist))
        const idlist = this.state.idlist.slice()
        const nodeidlist = idlist.map((id) => {
            return(
                <SubList
                    key={id}
                    listid={id}
                    handleDeleteToDo={()=>this.handleDeleteToDo(id)}
                />
            )
        })

        return (
            <div className="todo-list-container">
                <p>This is todo list</p>
                <div className="sublist-container">
                    <div className="todo-create-btn-container">
                        {nodeidlist}
                        <button 
                            className="create-todo-list-btn"
                            onClick={() => this.handleCreateToDo()}
                            >
                            +
                        </button>
                    </div>
                </div>
            </div>
        )    
    }
}

export default ToDoList;
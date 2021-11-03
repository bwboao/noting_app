import React from 'react';
import './todolist.css'

class ToDoItem extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            inputvalue: "",
            copy: false,
            checked: this.props.checked,
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
        // console.log("MOUNT TODO ITEM",this);
        if(this.props.checkbox)
            this.props.handleStoreItem(this.state.checked,this.inputRef.current.outerText);
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

        // save the whole tree
        // console.log("blur",this.state.inputvalue,e.target.outerText);
        this.props.handleStoreItem(this.state.checked,e.target.outerText);
    }
    handleCheck(e){
        // console.log(e);
        let status = this.state.checked;
        this.setState({
            checked: !status,
        })
        // store checked
        // console.log("checked status:",!status,this.inputRef.current.outerText);
        this.props.handleStoreItem(!status,this.inputRef.current.outerText);
    }

    render(){

        let itemcheck;
        if(this.props.checkbox === true){
            itemcheck = <input 
            type="checkbox" 
            id="check"
            className="todo-checkbox"
            // onClick={(e)=>this.handleCheck(e)}
            onChange={(e)=>this.handleCheck(e)}
            checked={this.state.checked}
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
                        className={ this.state.checked
                                        ? "todo-item-input todo-item-checked"
                                        : "todo-item-input"}
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
                checked: false,
                focus: false,
            }],
            itemsDone: [],
            sublistTitle: "To-do",
            renew: true,
        }
    }
    componentDidMount(){
        // check if there things in is localstorage
        const storedtree = localStorage.getItem('toDoList');
        if (storedtree){
            const parsedtree = JSON.parse(storedtree);
            parsedtree.forEach(list => {
                if(list.id === this.props.listid){
                    // console.log("did mount",list,this.props.listid)
                    this.setState({
                        itemsTodo: list.tree,
                        sublistTitle: list.sublistTitle
                    })
                }
            });
        }
    }

    handleStoreItem(id,checked,inputvalue){
        // console.log("storing",id,checked,inputvalue);
        // console.log("storing itemesTodo",this.state.itemsTodo);
        const itemsTodo = this.state.itemsTodo.slice();
        itemsTodo.map((item) => {
            if(item.id === id){
                item.value = inputvalue;
                item.checked = checked;
            }
            item.focus = false;
        })
        this.props.handleStoreToDoList(itemsTodo);
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
                checked: false,
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
            checked: false,
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
        this.props.handleStoreToDoList(itemsTodo);
    }
    handleStoreSubListTitle(e){
        console.log(e.target.innerText);
        this.props.handleStoreSubListTitle(e.target.innerText);
    }

    render(){
        // console.log("this is id",this.props.listid,"my delete handle is",this.props.handleDeleteToDo)

        const itemsTodo = this.state.itemsTodo.slice();
        let todoitems;let doneitems;
        if(itemsTodo.length === 0){
            todoitems = null
        }else{
            todoitems = itemsTodo.map((item,index) =>{
                // console.log(item);
                if(item.id === "create") return null;
                if(item.checked === true) return null;
                return(
                <ToDoItem
                    key={item.id}
                    id={item.id}
                    value={item.value}
                    handleClickLabel={(e) => this.handleClickLabel(e)}
                    handleToDoBlur={(e,f) => this.handleToDoBlur(e,f)}
                    handleDeleteToDoItem={()=>this.handleDeleteToDoItem(item.id)}
                    handleCreateNext={(e)=>this.handleCreateNext(e)}
                    handleStoreItem={(e,f)=>this.handleStoreItem(item.id,e,f)}
                    placeholder="..."
                    checkbox={true}
                    focus={item.focus}
                    checked={item.checked}
                />)
            });

            doneitems = itemsTodo.map((item,index) =>{
                // console.log(item);
                if(item.id === "create") return null;
                if(item.checked === false) return null;
                return(
                <ToDoItem
                    key={item.id}
                    id={item.id}
                    value={item.value}
                    handleClickLabel={(e) => this.handleClickLabel(e)}
                    handleToDoBlur={(e,f) => this.handleToDoBlur(e,f)}
                    handleDeleteToDoItem={()=>this.handleDeleteToDoItem(item.id)}
                    handleCreateNext={(e)=>this.handleCreateNext(e)}
                    handleStoreItem={(e,f)=>this.handleStoreItem(item.id,e,f)}
                    placeholder="..."
                    checkbox={true}
                    focus={item.focus}
                    checked={item.checked}
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
                    <span 
                        contentEditable="true"
                        spellCheck="false"
                        suppressContentEditableWarning={true}
                        onBlur={(e)=>this.handleStoreSubListTitle(e)}
                    >
                        {this.state.sublistTitle}
                    </span>
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
                    handleStoreItem={(e)=>this.handleStoreItem("add"+this.state.renew,e)}
                    placeholder="Add sth to the list..."
                    checkbox={false}
                    renew={this.state.renew}
                />
                <hr className="todolist-hr"/>
                {doneitems}
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
            todotree : [],
        };
    }

    componentDidMount(){
        // check if there things in is localstorage
        const storedtree = localStorage.getItem('toDoList');
        if (storedtree){
            const parsedtree = JSON.parse(storedtree);
            console.log("TODOLISTMOUNT",parsedtree)
            let idlist = [];
            let count = 0;
            parsedtree.map((list) =>{
                idlist = idlist.concat([list.id]);
                count++;
            })
            this.setState({
                count: count,
                idlist: idlist,
                todotree: parsedtree,
            })
        }
    }

    storeTree(todotree){
        // localStorage
        if (todotree.length === 0){
            // console.log("clear the localstorage");
            localStorage.removeItem('toDoList');
        }
        // const tree = JSON.stringify(this.state.todotree.slice());
        const tree = JSON.stringify(todotree.slice());
        localStorage.setItem('toDoList',tree);
        // const storedtree = localStorage.getItem('toDoList')
        // console.log("stored", JSON.parse(storedtree));
    }
    handleStoreSubListTitle(id,title){
        let todotree = this.state.todotree.slice();
        todotree.map((list)=>{
            if(list.id === id){
                list.sublistTitle = title
            }
        })
        this.setState({
            todotree: todotree
        })
        this.storeTree(todotree);
        console.log("subtitle",todotree,id,title)
    }
    handleStoreToDoList(id,e){
        let idlist = this.state.idlist.slice();
        let todotree = this.state.todotree.slice();
        todotree.map((list)=>{
            if(list.id === id){
                list.tree = e
            }
        })
        // console.log("storing the tree",id,e);
        // console.log("storing the tree",idlist,todotree);
        this.setState({
            todotree:  todotree
        })
        this.storeTree(todotree)
    }
    
    handleCreateToDo(){
        // use the time created as id
        const listid = Date.now();
        const idlist = this.state.idlist.slice()
        const todotree = this.state.todotree.slice()
        this.setState({
            count: this.state.count + 1,
            idlist: idlist.concat([listid]),
            todotree: todotree.concat([{id: listid, tree: null, sublistTitle: "To-do"}]),
        });
        console.log("clicked",listid);
    }
    isIdSame(item){
        // console.log(item.id,this,item.id === this,item.id == this)
        return item.id === this;
    }

    handleDeleteToDo(id){
        const idlist = this.state.idlist.slice()
        let todotree = this.state.todotree.slice()
        let pos = idlist.indexOf(id)
        let removedid = idlist.splice(pos,1)
        pos = todotree.findIndex(this.isIdSame,id);
        removedid = todotree.splice(pos,1);
        this.setState({
            count: this.state.count - 1,
            idlist: idlist,
            todotree: todotree
        });
        console.log("deleted",id,idlist,todotree,removedid);
        this.storeTree(todotree);
    }

    render(){
        // console.log(this.state,typeof(this.state.idlist))
        // console.log("render",this.state)
        const idlist = this.state.idlist.slice()
        const nodeidlist = idlist.map((id) => {
            return(
                <SubList
                    key={id}
                    listid={id}
                    handleDeleteToDo={()=>this.handleDeleteToDo(id)}
                    handleStoreToDoList={(e)=>this.handleStoreToDoList(id,e)}
                    handleStoreSubListTitle={(e)=>this.handleStoreSubListTitle(id,e)}
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
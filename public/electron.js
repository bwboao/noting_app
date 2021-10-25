// import path from path
const path = require('path')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
// import { app, BrowserWindow } from "electron"
// import isDev from "electron-is-dev"
const isDev = require('electron-is-dev')
const fs = require('fs');
// const { stringify } = require('querystring');

function createWindow(){
    // Create the window
    const win = new BrowserWindow({
        width: 1200,
        height: 670,
        backgroundColor: '#19243B',
        webPreferences:{
            preload: path.join(__dirname,'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    console.log(`file://${path.join(__dirname, '../build/index.html')}`);
    // let file = `file://${path.join(__dirname, '../build/index.html')}`
    file = './build/index.html'
    win.loadURL(
        isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );
    // win.loadURL('http://localhost:3000');
    // win.loadFile(file)
    // win.webContents.openDevTools({ mode: 'detach'});
    // Open the Devtools.
    // comment if build
    if(isDev){
        win.webContents.openDevTools({ mode: 'detach'});
    }
}

app.whenReady().then(()=>{
    createWindow()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


app.on('window-all-closed', function(){
    if(process.platform !== 'darwin') app.quit()
})


// Return the BasePath things are stored
ipcMain.on('getpath', (event, arg) =>{
    console.log(arg) // prints the value sent
    // asynchronous msg
    // event.reply = app.getPath("userData")
    // event.reply = "userData"
    // syncshronous msg
    event.returnValue = app.getPath("userData");
    // event.returnValue = "userData";
})

const documentPath = app.getPath("documents");
const dataPath = `${documentPath}/noting/`
// get the files stored in the directory
// create the dataPath if not exist
if(!fs.existsSync(dataPath)){
    try{
        fs.mkdirSync(dataPath)
    } catch (err){
        console.error(err)
    }
    try {
        // fetch the files in the dir
        notelist = fs.readdirSync(dataPath);
    } catch (error) {
        console.log("1 can't readdir",dataPath)
    }
}else{
    try {
        // fetch the files in the dir
        notelist = fs.readdirSync(dataPath);
    } catch (error) {
        console.log("2 can't readdir",dataPath)
    }
}

function checkPath(path){
    if(!fs.existsSync(path)){
        try{
            fs.mkdirSync(path)
        } catch (err){
            console.error(err)
        }
    }
}

function checkToc(path){
    if(!fs.existsSync(path+"toc.json")){
        let dict = [{
            type: "total",
            count: 0,
            folder: [],
        }];
        try{
            console.log("creating toc",JSON.stringify(dict,null,2))
            fs.writeFileSync(path+"toc.json",JSON.stringify(dict,null,2),'utf-8');
        }catch(err){
            console.error(err)
        }
    }
}

// update the notelistx
ipcMain.on('getList', (event, arg) =>{
    console.log('getlist',arg)
    const type = arg;
    const listpath = dataPath+type+"/";
    checkPath(listpath);
    checkToc(listpath);
    let dict = "fail"
    try {
        // fetch the files in the dir
        // read the toc
        dict = fs.readFileSync(listpath+"toc.json",'utf-8');
        console.log(dict);
        dict = JSON.parse(dict);
    } catch (error) {
        console.log("can't readdir",dataPath)
    }
    //return an Array instead of an object e.g. [1,2,3]
    event.returnValue = dict;
})

// save a file
ipcMain.on('newFile', (event, arg) =>{
    console.log("newfiling",arg);
    let status="new success";
    const [type,value] = arg
    // date = Date.now()
    const filepath = dataPath+type+"/"
    const filename = filepath+value.id+".json"
    // check if path exist
    checkPath(filepath);
    // check if toc exist
    checkToc(filepath);
    // save the to a tree
    try{
        let dict = fs.readFileSync(filepath+"toc.json",'utf-8');
        // console.log(dict);
        dict = JSON.parse(dict);
        // console.log(dict);
        dict = dict.concat([{
            id: value.id,
            filename: value.filename,
            brief: value.value.substring(0,20), //first 20
            lastModifiedDate: Date.now(),
            folder: value.folder,
        }])
        // console.log(dict);
        fs.writeFileSync(filepath+"toc.json",JSON.stringify(dict,null,2),'utf-8')
    }catch(err){
        console.error(err)
    }
    
    try {
        //save the file
        console.log("type,value = ",type,value)
        fs.writeFileSync(filename,JSON.stringify(value,null,2),'utf-8')
    } catch(error){
        console.log("can't new file:",error);
        status = "new fail"
    }
    event.returnValue = status;
})

function findId(item){
    // console.log("comparing i,this:",item,this,Number(this)); 
    // console.log("typeof",typeof(item.id),typeof(this),Number(this));
    return item.id === Number(this);
}
// parse the bried correctly
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
// saveFile
ipcMain.on('saveFile',(event,arg) =>{
    console.log('saving file',arg);
    let status="save success";
    const [type,value] = arg;
    const filepath = dataPath+type+"/";
    const filename = filepath+value.id+".json";
    checkPath(filepath);
    checkToc(filepath);
    //update the toc
    try{
        let dict = fs.readFileSync(filepath+"toc.json",'utf-8');
        dict = JSON.parse(dict);
        console.log("dict:",dict);
        console.log("type of dict",typeof(dict));
        dict = Array.from(dict);
        console.log("type of dict",typeof(dict));
        // let fileid = value.id;
        console.log("finding id:",value.id)
        pos = dict.findIndex(findId,value.id);
        if(pos === -1) {status="save fail"; event.returnValue = status; return;}
        //first 20
        let brief = parseBrief(value.value);
        dict[pos] = {
            id: value.id,
            filename: value.filename,
            brief: brief,
            lastModifiedDate: Date.now(),
            folder: value.folder,           
        };
        // console.log("dict:",dict);
        fs.writeFileSync(filepath+"toc.json",JSON.stringify(dict,null,2),'utf-8');
    }catch(err){
        console.error(err);
    }
    //save the file
    try {
        // console.log("type,value = ",type,value)
        fs.writeFileSync(filename,JSON.stringify(value,null,2),'utf-8')
    } catch(error){
        console.log("can't save file:",error);
        status = "save fail"
    }
    event.returnValue = status;
})
// delete a file
function deleteFile(e,arg){
    console.log('deleting file',arg);
    let status = "delete success"
    const [type,fileid] = arg;
    const filepath = dataPath+type+"/";
    const filename = filepath+fileid+".json";
    checkPath(filepath);
    checkToc(filepath);
    //update the toc; delete the JSON for given fileid
    try{
        let dict = fs.readFileSync(filepath+"toc.json",'utf-8');
        dict = JSON.parse(dict);
        console.log("dict:",dict);
        dict = Array.from(dict);
        // let fileid = value.id;
        console.log("finding id:",fileid)
        pos = dict.findIndex(findId,fileid);
        if(pos === -1) {status="delete fail"; e.returnValue = status; return;}
        //first 20
        dict.splice(pos,1)
        // console.log("dict:",dict);
        fs.writeFileSync(filepath+"toc.json",JSON.stringify(dict,null,2),'utf-8');
    }catch(err){
        console.error(err);
        status = "delete fail"
    }
    // delete the file
    try{
        fs.rmSync(filename);
    }catch{
        console.error(err)
        status = "delete fail"
    }
}
// wait on deleteFile (not used)
ipcMain.on('deleteFile',(event,arg) =>{
    deleteFile(event,arg);
})
// wait on right click on note
ipcMain.on("context-menu-note", (event,arg) =>{
    const template = [
        {
            label: 'delete note',
            click: ()=> {
                console.log("delete "+arg)
                deleteFile(event,arg);
            }
        },
    ]
    const menu = Menu.buildFromTemplate(template);
    menu.popup(BrowserWindow.fromWebContents(event.sender));
    event.returnValue = "menu-created";
})


// read a file; if fail return "read fail"
ipcMain.on('readFile',(event,arg) =>{
    console.log('reading file',arg);
    let status = "read success";
    const [type,fileid] = arg;
    const filepath = dataPath+type+"/";
    const filename = filepath+fileid+".json";
    checkPath(filepath);
    checkToc(filepath);
    // read the file
    let filevalue = null;
    try{
        filevalue = fs.readFileSync(filename,'utf-8');
        filevalue = JSON.parse(filevalue);
    }catch(err){
        console.error(err);
        status = "read fail"
    }
    event.returnValue = [status,filevalue]; 
});
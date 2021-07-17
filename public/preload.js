// The preload script handles reading the notes and journals 
// before the app fires up.
// const {app, contextBridge} = require('electron');
// const fs = require('fs');


// const documentPath = app.getPath("documents");
// const dataPath = `${documentPath}/noting/`

// // create the dataPath if not exist
// if(!fs.existsSync(dataPath)){
//     notelist = fs.promises.mkdir(dataPath,{recursive: true}).then(() => {
//         return fs.promises.readdir(dataPath).then(()=>{
//             window.notelist = notelist;
//         })
//     })
// }else{
//     notelist = fs.promises.readdir(dataPath).then(()=>{
//         window.notelist = notelist;
//     })
// }

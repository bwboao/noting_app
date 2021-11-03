# Full feature branch
The original purpose is to train my skill, so no extra npm modules is used, functions are all written from scratch (and ugly). The full feature branch is for fulfilling a better UX (such as Rich editor) which will use others' module, since building from scratch is meaningless.

# Noting app
A [React](https://reactjs.org/) + [Electron](https://www.electronjs.org/) combined project for code learning.
This project is for own-use locally, **should not load any other internet resources, may be vulnerable.**

![image](https://user-images.githubusercontent.com/20790736/138731376-be012c38-272d-4266-b98c-4150d18a3c05.png)

## To-do list
Add new To do lists, write anything down and delete them as you want, check them out when finished!

## Notes
You can create note and delete note, no markdown is supported, just plain text for now. The notes are ordered by the date last changed.

## Journal
You can create journal(s) for today, seven days are shown initially, click show more for 7 more days.
Click any journal to edit them.

## Storage
The notes and journals are stored at Document/noting for both system (Windows and Mac) using `fs` as `JSON` files.
The app mantains it with a file named `toc.json`, make sure to delete the entry if you delete files manually.(Or just whipe the whole directory)

The to-do list is not stored as files, it is stored in the browser's storage using `localStorage`, this may be cleared(if intended or something breaks). Try writing important informations in notes instead of to-do list.

## packaging
I use `electron-builder` to pack the files into an Windows app.
First build the react app with react-scripts
```
npm run build
```

Second run the package
```
npm run package
```

The command used is written in package.json which is
```
electron-builder build --win -c.extraMetadata.main=build/electron.js --publish never
```
If you want a portable executable file
```
electron-builder build --win portable -c.extraMetadata.main=build/electron.js --publish never
```

## fs.existssync is not a function
If you pull this project directly, installing the npm dependencies. After running there might be this warning, it is an issue, my way solving is [changing webpack configs as mentioned in a github issue](https://github.com/electron/electron/issues/9920#issuecomment-478826728). Then everything should just run fine.

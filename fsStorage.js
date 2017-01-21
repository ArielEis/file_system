/**
 * Created by ariel on 19/01/2017.
 */

const readSync = require("readline-sync");

var help = [
    ['cd', '  Change current directory', 'Usage: cd [folder-name]'],
    ['dir', ' Print current directory', 'Usage: dir'],
    ['help', 'Print all commands or usage for specific command', 'Usage: help [optional: command]'],
    ['md', '  Create new folder', 'Usage: md [folder-name]'],
    ['mf', '  Create new file', 'Usage: mf [file-name] [optional: content]'],
    ['open', 'Open file', 'Usage: open [file-name]'],
    ['rd', '  Remove directory or file', 'Usage: rd [folder-name]'],
    ['rf', '  Remove file only', 'Usage: rf [file-name]'],
    ['quit', 'Quit', 'Usage: quit'],
];

var fsStorage = [
    [0, 0, 'root'],
    [1, 0, 'subfolder1'],
    [2, 0, 'subfolder2'],
    [3, 0, 'subfolder3'],
    [4, 1, 'subfolder4'],
    [5, 4, 'subfolder5'],
    [6, 5, 'file1.txt', 'content'],
    [7, 5, 'file2.txt', 'content']
];


var quit = false;
var wantQuit = false;
var input;
var address = 'root';
var navigateIndex = 0;            // distance from root folder
var addressIndex = 0;            // Pointer to current id folder
var output = address+'>  ';
var isFirstTime = true;



while (!quit){
    if (isFirstTime){
        isFirstTime = false;
        input = 'help'
    }else{
        input = readSync.question(output);
    }

    switch (getWord(input,1)) {

        case 'help':
            if (wordCount(input) === 1) {
                printHelp();
            }else if (wordCount(input) === 2) {
                if (searchWordInHelp(getWord(input, 2))){
                    printUsageHelp(getWord(input, 2));
                }else{
                    console.log("Command \'"+getWord(input, 2)+"\' is not Exist"+"\n")
                }
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'dir':
            if (wordCount(input) === 1) {
                printDir(addressIndex);
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'cd':
            if (wordCount(input) === 2) {
                changeDir(getWord(input, 2));
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'md':
            if (wordCount(input) === 2) {
                createDir(getWord(input, 2));
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'mf':
            if (wordCount(input) === 2) {
                createFile(getWord(input, 2),'empty_file');
            }else if (wordCount(input) >= 3){
                createFile(getWord(input, 2),getContent(input));
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'rf':
            if (wordCount(input) === 2) {
                deleteFile(getWord(input, 2));
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'rd':
            if (wordCount(input) === 2) {
                deleteFolder(getWord(input, 2), addressIndex);
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'open':
            if (wordCount(input) === 2) {
                openFile(getWord(input, 2));
            }else{
                console.log("Invalid command"+"\n");
            }
            break;

        case 'quit':
            if (wordCount(input) === 1){
                output = 'Are you sure? [Y/N]: ';
                wantQuit = true;
                while(wantQuit) {
                    input = readSync.question(output);
                    if (wordCount(input) === 1) {
                        if (input.toLowerCase() === 'y'){
                            wantQuit = false;
                            quit = true;
                        }else if (input.toLowerCase() === 'n'){
                            wantQuit = false;
                        }
                    }else{
                        console.log("Invalid command"+"\n");
                    }
                }
            }
            break;

        case '':
            break;

        case 'debug':
          console.log(fsStorage);
            break;

        default:
            console.log("Invalid command"+"\n");
            break;

    }

    output = address+'>  ';
}




function printHelp(){
    console.log("<help> commands list: ");
    for (var i=0; i<help.length; i++){
        console.log(help[i][0]+"        "+help[i][1]);
    }
    console.log("\n");
}

function searchWordInHelp(str){
    var isExist = false;
    for (var i=0; i<help.length; i++){
        if (help[i][0] === str){
            isExist = true;
            break;
        }
    }
    return isExist;

}

function printUsageHelp(str){
    for (var i=0; i<help.length; i++){
        if (help[i][0] === str){
            console.log('\x1b[36m',help[i][2],'\x1b[0m');
            console.log("\n");
            break;
        }
    }
}

function printDir(index){
    var countFolders = 0;
    var countFiles = 0;
    var folders = [];
    var files = [];
    console.log("  "+fsStorage[addressIndex][2]+':');
    if (addressIndex>0) {
        console.log('     ..');
    }
    for (var i=0; i<fsStorage.length; i++){
        if (fsStorage[i][1] === index && fsStorage[i][0] !== index){
            if (fsStorage[i][3] === undefined){   // Folder
                countFolders++;
                folders.push(fsStorage[i][2]);
            }else{                              // Files
                countFiles++;
                files.push(fsStorage[i][2]);
            }
        }
    }

    if((countFolders>0) || (countFiles>0)){
        folders.sort();
        files.sort();
        for (var i=0; i<folders.length; i++){
            console.log('     -'+folders[i]);
        }
        for (var i=0; i<files.length; i++){
            console.log('     -'+files[i]);
        }
        console.log("\n  "+countFolders+" folders(s) and "+countFiles+" file(s) were found");
        console.log("\n");
    }else{
        console.log('\x1b[32m','    -Empty','\x1b[0m');
        console.log("\n");
    }
}


function changeDir(folder){
    if (navigateIndex>0 && folder === '..'){
        addressIndex = fsStorage[addressIndex][1];
        var splitAddress = address.split("/");
        address = '';
        for (var i=0; i<navigateIndex; i++){
            address+=splitAddress[i];
            if (i !== (navigateIndex-1) ){
                address+="/";
            }
        }
        navigateIndex--;
        printDir(addressIndex);
        return;
    }
    var isExist = false;
    for (var i=0; i<fsStorage.length; i++){
        if ((fsStorage[i][2] === folder) && (fsStorage[i][1] === addressIndex)){
            address += "/"+fsStorage[i][2];
            addressIndex = fsStorage[i][0];
            navigateIndex++;
            isExist = true;
            break;
        }
    }
    if (isExist){
        printDir(addressIndex);
    }else{
        console.log("Invalid location: "+"\'"+folder+"\'");
        console.log("\n");
    }
}


function createDir(folderName){
    if (folderName.indexOf(".") === -1)
    {
        for (var i=0; i<fsStorage.length; i++){
            if((fsStorage[i][1] === addressIndex) && (fsStorage[i][2] === folderName.toLowerCase())){
                console.log("Error: folder name \'"+folderName+"\' exist");
                console.log("\n");
                return;
            }
        }
        console.log("\'" + folderName + "\' created");
        fsStorage.push([fsStorage.length,addressIndex,folderName.toLowerCase()]);
        printDir(addressIndex);
    }else{
        console.log("Error: \'" + folderName + "\' is not valid name for directory");
    }

}

function createFile(fileName, content){
    if (fileName.indexOf(".") > -1) {
        for (var i = 0; i < fsStorage.length; i++) {
            if ((fsStorage[i][1] === addressIndex) && (fsStorage[i][2] === fileName.toLowerCase())) {
                console.log("Error: \'" + fileName + "\' is exist");
                console.log("\n");
                return;
            }
        }
        fsStorage.push([fsStorage.length, addressIndex, fileName.toLowerCase(), content]);
        console.log("\'" + fileName + "\' was created");
        printDir(addressIndex);
    }else{
        console.log("Error: \'" + fileName + "\' is not valid name for file");
    }
}


function openFile(fileName){
    if (isExist(fileName)){
        var id = getID(fileName);
        if(!isFolder(id)){
            console.log("  "+fsStorage[id][2]+":");
            console.log("     "+fsStorage[id][3]);
            console.log("\n");
        }else{
            console.log("Error: could not open \'"+fileName+"\' (try cd command)");
            console.log("\n");
        }
    }else{
        console.log("Error: \'"+fileName+"\' file isn\'t exist");
        console.log("\n");
    }

}

function deleteFile(fileName){
    var index = -1;
    for (var i=0; i<fsStorage.length; i++){
        if((fsStorage[i][1] === addressIndex) && (fsStorage[i][2] === fileName.toLowerCase())){
            index = i;
        }
    }
    if (!isFolder(i)){
        if( index > -1){
            console.log("\'" + fileName + "\' was deleted");
            fsStorage.splice(index,1);
            printDir(addressIndex);
        }else {
            console.log("Error: \'" + fileName + "\' isn\'t exist");
            console.log("\n");
        }
    }else{
        console.log("Error: \'" + fileName + "\' is not a file");
        console.log("\n");
    }

}

function deleteFolder(folderName, pointer_index){
    var index = -1;
    for (var i=0; i<fsStorage.length; i++){
        if(fsStorage[i][2] === folderName.toLowerCase()){
            index = i;
        }
    }
    if (index === 0){
        console.log("\'" + folderName + "\' cannot be deleted!");
        console.log("\n");
    }else if( index > 0) {
        var folderContent = [];
        var popIndex = 0;
        while (!folderIsEmpty(index)) {
            folderContent = getFolderContent(index);
            popIndex = folderContent.pop();
            deleteFolder(fsStorage[popIndex][2], fsStorage[popIndex][0]);
            i++;
        }
          console.log("\'" + folderName + "\' was deleted");
          fsStorage.splice(index,1);
          if (pointer_index === addressIndex) {
              console.log("\n");
              printDir(addressIndex);
          }
    }else {
        console.log("Error: \'" + folderName + "\' isn\'t exist");
        console.log("\n");
    }
}

function folderIsEmpty(id){
    for (var i=0; i<fsStorage.length; i++){
        if (fsStorage[i][1] === id){
            return false;
        }
    }
    return true;
}

function getFolderContent(id){
    var content = [];
    for (var i=0; i<fsStorage.length; i++){
        if (fsStorage[i][1] === id){
            content.push(fsStorage[i][0]);
        }
    }
    return content;
}


function wordCount(str) {
    return str.split(" ").length;
}

function getWord(str, index) {
    var words = str.split(' ');
    return words[index-1];
}

function getContent(str) {
    var words = str.split(' ');
    var content = '';
    for (var i=2; i<words.length; i++){
        content+=words[i]+" ";
    }
    return content;
}

function isFolder(id){
    if (fsStorage[id].length === 3){
        return true;
    }
    return false;
}

function getID(name){
    for (var i=0; i<fsStorage.length; i++){
        if((fsStorage[i][1] === addressIndex) && (fsStorage[i][2] === name.toLowerCase())){
            return fsStorage[i][0];
        }
    }
    return -1;
}

function isExist(name){
    for (var i=0; i<fsStorage.length; i++){
        if((fsStorage[i][1] === addressIndex) && (fsStorage[i][2] === name.toLowerCase())){
            return true;
        }
    }
    return false;
}

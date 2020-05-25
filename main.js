const electron = require("electron")
const url = require("url")
const path = require("path")

const {app, BrowserWindow, Menu, ipcMain} = electron;

//process.env.NODE_ENV = "production";

let mainWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        icon:  
            process.platform == 'win32' ? path.join(__dirname, '/assets/icons/win/icon.ico') :
            process.platform == 'darwin' ? path.join(__dirname, '/assets/icons/mac/icon.icns') : 
            path.join(__dirname, '/assets/icons/png/icon.png')
        ,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file:",
        slashes: true
    }));
    mainWindow.on('close', function(){
        app.quit()
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu)
})

const mainMenuTemplate = [
    {
        label:"File",
        submenu:[
            {
                label: "Quit",
                accelerator: process.platform == 'darwin' ? "Command+Q" :
                "Ctrl+Q",
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}


if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? "Command+I" :
                "Ctrl+I",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

const electron = require('electron')
const {ipcRenderer} = electron;
const path = require('path')

window.onload=function(){
    const home = document.querySelector('#home')
    home.addEventListener('click', showHome)
    showHome()
}

function showHome(event){
    $("#content").load("./pages/home/home.html", function(){$.getScript('./pages/home/home.js')})
}


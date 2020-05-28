const electron = require('electron')
const {ipcRenderer} = electron;
const path = require('path')

window.onload=function(){
    const home = document.querySelector('#home')
    const filter = document.querySelector('#filter')
    home.addEventListener('click', showHome)
    filter.addEventListener('click', showFilter)
    showHome()
}

function showHome(event){
    $("#content").load("./pages/home/home.html", function(){$.getScript('./pages/home/home.js')})
}

function showFilter(event){
    $("#content").load("./pages/filter/filter.html", function(){$.getScript('./pages/filter/filter.js')})
}

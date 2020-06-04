const electron = require('electron')
const {ipcRenderer} = electron;
const path = require('path')
global.props = {table: null}
global.props = {atoms: null}

window.onload=function(){
    const home = document.querySelector('#home')
    const filter = document.querySelector('#filter')
    const diagram = document.querySelector('#diagram')
    home.addEventListener('click', showHome)
    filter.addEventListener('click', showFilter)
    diagram.addEventListener('click', showDiagram)

    showHome()
}

function showHome(event){
    $("#content").load("./pages/home/home.html", function(){$.getScript('./pages/home/home.js')})
}

function showFilter(event){
    $("#content").load("./pages/filter/filter.html", function(){$.getScript('./pages/filter/filter.js')})
}
function showDiagram(event){
    $("#content").load("./pages/diagram/diagram.html", function(){$.getScript('./pages/diagram/diagram.js')})
}
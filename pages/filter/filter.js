var workbook = new ExcelJS.Workbook();

$("#filter-button").on("click", function(event){
    const atom = $(".atom").val()
    const minimum = $(".minimum").val()
    const maximum = $(".maximum").val()
    console.log(atom, minimum, maximum)
    console.log(global.sharedObj.table)
    let remove_rows = []
    global.sharedObj.table.rows().every(function (rowIdx, tableLoop, rowLoop){
        //console.log(value)
        //console.log(value[1])
        //console.log(this.data())
        const arr = this.data()[4].match(/[A-Z][a-z]*[0-9]?[0-9]?[0-9]?/g)
        const mappedArray = arr.map(a => /\d/g.test(a) ? a : a+1)
        console.log(mappedArray)
        for(let i = 0; i < mappedArray.length; i++){
            if(mappedArray[i].includes(atom)){
                if(mappedArray[i].charAt(mappedArray[i].indexOf(atom)+1).match(/^[0-9]+$/) != null){

                    console.log("Found atoms:", mappedArray[i])
                    const count = parseInt(mappedArray[i].replace(atom, ""))
                    if(count < minimum || count > maximum){
                        remove_rows.push(rowIdx)
                        console.log("remove")
                    }
                }
            }
        }
    })
    for(let j = remove_rows.length -1; j > -1; j--){
        global.sharedObj.table.row(remove_rows[j]).remove()
    }
    global.sharedObj.table.draw()
})

$("#dragable").on("dragover", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    $(this).addClass('dragging');
});

$("#dragable").on("dragleave", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    $(this).removeClass('dragging');
});

$("#dragable").on("drop", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    console.log("Dropped!");
    console.log(event.originalEvent.dataTransfer.files)
    for(let i = 0; i < event.originalEvent.dataTransfer.files.length; i++) {
        workbook.xlsx.readFile(event.originalEvent.dataTransfer.files[i].path).then( (document) => {
            generateTable(document)
        })
        break // Support for several documents not implemented
    }
}); 

// TODO: This is vulnerable to injection
function generateTable(document){
    let header_list = []
    let header = document.worksheets[0].getRow(1).values
    for(let i = 0; i < header.length; i++){
        header_list.push({"title": header[i], "className": header[i]})
    }

    let table = $('#preview-table').DataTable({
        dom: 'Bfrtip',
        buttons: [
            {
                text: 'export',
                extend: 'excel',
                filename: 'Filtered_progenesis',
                title: ''
            },
        ],
        "columns": header_list.slice(1),
        "paging": false
    })

    document.worksheets[0].eachRow({ includeEmpty: true }, function(row, rowNumber){
        if(rowNumber > 1){
            real_row = []
            row.eachCell({includeEmpty: true}, function(cell, colNumber){
                real_row.push(cell.value == null ? "" : cell.value)
            })
            table.row.add(
                real_row
            )
        }

    })
    table.draw()
    global.sharedObj = {table: table};
}

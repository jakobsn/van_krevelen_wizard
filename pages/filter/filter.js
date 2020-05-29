var workbook = new ExcelJS.Workbook();

let table

$("#filter").on("click", function(){

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
        header_list.push({"title": header[i]})
    }

    table = $('#preview-table').DataTable({
        buttons: [
            {
                text: 'Export',
                extend: 'excel',
                filename: 'Filtered_progenesis',
                title: ''
            }
        ],
        "columns": header_list.slice(1),
        "paging": false,
        select: true,
        searchPanes:{
            cascadePanes: true,
            viewTotal: true,
        },
        dom: 'BPfrtip'

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

}

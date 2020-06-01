var workbook = new ExcelJS.Workbook();

$("#filter-button").on("click", function(event){
    let remove_rows = []

    atom_min_map = {}
    atom_max_map = {}
    $(".include-atoms").each(function(index, object){
        atom_min_map[$(object).children(".atom").text()] = $(object).children(".minimum").val()
        atom_max_map[$(object).children(".atom").text()] = $(object).children(".maximum").val()
    })
    global.sharedObj.table.rows().every(function (rowIdx, tableLoop, rowLoop){
        //console.log(value)
        //console.log(value[1])
        //console.log(this.data())
        const arr = this.data()[4].split("[").join("").split("]").join("").match(/[A-Z][a-z]*[0-9]?[0-9]?[0-9]?/g)
        const mappedArray = arr.map(a => /\d/g.test(a) ? a : a+1)
        for(let i = 0; i < mappedArray.length; i++){

            const atom = mappedArray[i].match(/[A-Z][a-z]*/g)[0]
            const count = mappedArray[i].match(/[0-9][0-9]?[0-9]?/g)[0]

            if(atom_min_map[atom] > parseInt(count) || atom_max_map[atom] < parseInt(count)){
                remove_rows.push(rowIdx)
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

    let atoms = []
    document.worksheets[0].eachRow({ includeEmpty: true }, function(row, rowNumber){
        if(rowNumber > 1){
            real_row = []
            row.eachCell({includeEmpty: true}, function(cell, colNumber){
                real_row.push(cell.value == null ? "" : cell.value)
            })
            table.row.add(
                real_row
            )
            // Find all atoms
            row_atoms = real_row[4].match(/[A-Z][a-z]*/g)
            row_atoms.forEach(function(atom){
                if(!atoms.includes(atom)){
                    atoms.push(atom)
                }
            })   
        }

    })
    table.draw()
    global.sharedObj = {table: table};
    console.log(atoms)
    atoms.forEach(function(atom){
        $("#filter-options").append(
            "<div class='include-atoms'>" +
                "Atom: <span class='atom'>" + atom + "</span>, " +
                "Minimum: <input type='text' name='minimum' class='minimum' value='0'>" +
                "Maximum: <input type='text' name='maximum' class='maximum' value='999'>" +
            "</div>"
        ) 
    })

}


var workbook = new ExcelJS.Workbook();


$("#diagram-button").on("click", function(event){
    $("#diagram").click()
})

$("#filter-button").on("click", function(event){
    let remove_rows = []

    const mass_err_min = $("#mass-err-min").val()
    const mass_err_max = $("#mass-err-max").val()
    let atom_min_map = {}
    let atom_max_map = {}
    const minimum_score = $("#minimum-score").val()
    $(".include-atoms").each(function(index, object){
        atom_min_map[$(object).children(".atom").text()] = $(object).children(".minimum").val()
        atom_max_map[$(object).children(".atom").text()] = $(object).children(".maximum").val()
    })
    global.props.table.rows().every(function (rowIdx, tableLoop, rowLoop){

        const arr = this.data()[4].split("[").join("").split("]").join("").match(/[A-Z][a-z]*[0-9]?[0-9]?[0-9]?/g)
        const mappedArray = arr.map(a => /\d/g.test(a) ? a : a+1)
        for(let i = 0; i < mappedArray.length; i++){

            const atom = mappedArray[i].match(/[A-Z][a-z]*/g)[0]
            const count = mappedArray[i].match(/[0-9][0-9]?[0-9]?/g)[0]

            if(atom_min_map[atom] > parseInt(count) || 
                atom_max_map[atom] < parseInt(count) || 
                parseFloat(this.data()[7]) > mass_err_max || 
                parseFloat(this.data()[7]) < mass_err_min ||
                parseFloat(this.data()[5]) < minimum_score){
                //console.log(this.data()[7])
                remove_rows.push(rowIdx)
                break
            }
        }
    })
    for(let j = remove_rows.length -1; j > -1; j--){
        global.props.table.row(remove_rows[j]).remove()
    }
    global.props.table.draw()
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
function validate(cell_value){
    if(cell_value == null){
        return true
    }
    else if(String(cell_value).charAt(0) == "=" || 
            String(cell_value).charAt(0) == "+" || 
            //String(cell_value).charAt(0) == "-" ||
            String(cell_value).charAt(0) == "@") {
        return "Invalid chatacter: " + cell_value.charAt(0)

    }
    else if(!String(cell_value).match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g) && String(cell_value).match(/[&]/g)){
        return "& only allowed in link"
    }
    else if(String(cell_value).match(/[<][/]/g) || 
            String(cell_value).match(/[/][>]/g) || 
            String(cell_value).match(/["]/g)){
            //String(cell_value).match(/[']/g))
        return "Invalid chatacter: \<\/,\/\>,\", or \'" 
    }

    return true
}


// TODO: This is vulnerable to injection
function generateTable(document){
    let header_list = []
    let header = document.worksheets[0].getRow(1).values
    for(let i = 0; i < header.length; i++){
        const message = validate(header[i])
        console.log(message)
        if(message === true){
            header_list.push({"title": header[i], "className": header[i]})
        }
        else{
            $("#dragable").append("<p>Invalid input in column 1" + " row: " + i + "" + message + "</p>")
            return false
        }
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
                const message = validate(cell.value)
                console.log(message, colNumber, rowNumber)
                console.log(cell.value)
                if(message === true){
                    real_row.push(cell.value == null ? "" : (""+cell.value+""))
                }
                else{
                    $("#dragable").append("<p>Invalid input in column: " + colNumber + " row: " + rowNumber + 
                    " message: " + message + "</p>")
                    return false
                }
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
    global.props = {table: table, atoms: atoms};
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

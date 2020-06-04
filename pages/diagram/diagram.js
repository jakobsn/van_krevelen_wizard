

$(function(){
    console.log("diagram")
    if(global.props.atoms != null){
        console.log(global.props.atoms)
        global.props.atoms.sort().forEach(atom => {
            $("#groups").append("<div>" + atom + 
                                "<input class='atom' type='checkbox' id=\"atom-" + atom + 
                                "\" value=\"" + atom + "\"></div>")
            
        });
    }
    else{
        alert("The excel file must be uploaded to filter generate a diagram")
    }
})

$("#generate-diagram").on("click", function(){
    selected_atoms = []
    groups = {}
    total_H_C = {}
    total_O_C = {}
    $(".atom").each(function(index, element){
        console.log(element)
        if($(element).is(":checked")){
            selected_atoms.push($(element).val())
        }
    })
    /*console.log(selected_atoms)
    selected_atoms.forEach(element=>{
        groups[element] = 0
    })*/
    selected_atoms
    groups = getCombinations(selected_atoms)
    console.log(groups)
    
    global.props.table.rows().every(function (rowIdx, tableLoop, rowLoop){

        const arr = this.data()[4].split("[").join("").split("]").join("").match(/[A-Z][a-z]*[0-9]?[0-9]?[0-9]?/g).sort()
        const mappedArray = arr.map(a => /\d/g.test(a) ? a : a+1)
        let group = ""
        for(let i = 0; i < mappedArray.length; i++){

            const atom = mappedArray[i].match(/[A-Z][a-z]*/g)[0]
            const count = mappedArray[i].match(/[0-9][0-9]?[0-9]?/g)[0]
            if(selected_atoms.includes(atom) && Object.keys(groups).includes((group + atom))){
                group += atom
            }
        }
        //console.log(group)
        groups[group] += 1
        if(groups[group] == 1){
            total_H_C[group] = [parseFloat(this.data()[27])]
            total_O_C[group] = [parseFloat(this.data()[28])]
        }
        else {
            total_H_C[group].push(parseFloat(this.data()[27]))
            total_O_C[group].push(parseFloat(this.data()[28]))
        }
        
    })
    console.log(total_H_C)
    data = []
    $("#diagram-view").html("")
    Object.keys(groups).forEach(key=>{
        x = []
        y = []
        if(groups[key] > 0){
            $("#diagram-view").append("<p>" + key + ": " + groups[key] + "</p>")
            console.log(total_H_C[key])
            for(var i = 0; i < total_H_C[key].length; i++){
                y.push(total_H_C[key][i])
                x.push(total_O_C[key][i])
            }
            data.push({
                x: x,
                y: y,
                mode: 'markers',
                type: 'scatter',
                name: key,
                text: key,
                marker: { size: 12 }
            })
        }
        
    })

      
      var layout = {
        xaxis: {
          range: [ 0, 1.5 ]
        },
        yaxis: {
          range: [0, 4]
        },
        title:'Van Krevelen diagram'
      };
      
      Plotly.newPlot('myDiv', data, layout);
      
})


function getCombinations(chars) {
    var result = {};
    var f = function(prefix, chars) {
      for (var i = 0; i < chars.length; i++) {
        result[prefix + chars[i]]=0;
        f(prefix + chars[i], chars.slice(i + 1));
      }
    }
    f('', chars);
    return result;
  }

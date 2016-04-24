function download(filename, text) {
  // http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function exportData(){
  var acc_list = homeJS.globalDataList;

  // TODO, make this part a common function
  var data = new google.visualization.DataTable();

  // initialize header
  var name_list = undefined;
  var type_list = undefined;
  if(homeJSLocal.visualModeToApply == "roadsegments"){
    name_list = ['Route Number', 'Begin Milepost', 'End Milepost', 'Accident Num'];
    type_list = ['string', 'number', 'number', 'number'];
  }else{
    name_list = ['Caseno', 'date', 'time', 'NumK', 'NumA', 'NumB','NumC'];
    type_list = ['number', 'string', 'string', 'number', 'number', 'number', 'number'];
  }
  for( var i = 0;i < name_list.length;i++){
    data.addColumn(type_list[i], name_list[i]);
  }

  if(homeJSLocal.visualModeToApply == "roadsegments"){
    for(var i=0;i < acc_list.length;i++){
      var casenum = 0;
      if (acc_list[i].casenolist != undefined)
        casenum = acc_list[i].casenolist.length;
      data.addRow([
          acc_list[i].cntyrte,
          acc_list[i].begmp,
          acc_list[i].endmp, 
          casenum
          ]);
    }
  }else{
    for(var i = 0;i < acc_list.length;i++){
      data.addRow([
          acc_list[i].caseno,
          acc_list[i].acc_date,
          acc_list[i].time,
          acc_list[i].num_k,
          acc_list[i].num_a,
          acc_list[i].num_b,
          acc_list[i].num_c
          ]);
    }
  }

  var csv = google.visualization.dataTableToCsv(data);
  console.log(csv);
  download('export.csv', csv);
}

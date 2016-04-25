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
  // TODO, make this part a common function
  var data = undefined;

  if(homeJSLocal.visualModeToApply == "roadsegments"){
    data = createSegData(homeJS.globalDataList);
  }else{ 
    data = createAccData(homeJS.globalDataList);
  }

  // data table
  var dt_cols = data.getNumberOfColumns();
  var csv_cols = [];
  // Iterate columns
  for (var i=0; i<dt_cols; i++) {
    // Replace any commas in column labels
    csv_cols.push(data.getColumnLabel(i).replace(/,/g,""));
  }
  // Create column row of CSV
  var csv_header = csv_cols.join(",")+"\r\n";

  var csv = google.visualization.dataTableToCsv(data);
  console.log(csv);
  download('export.csv', csv_header + csv);
}

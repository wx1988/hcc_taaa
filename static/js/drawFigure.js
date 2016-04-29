drawFigureVar = {
  currentView : 'severity'
};

function drawFigureInit(){
  // init the draw figure here
  // only show one statistics now
  $('#chartSelect').change(changeFigure);
  drawSeverity();
}

function changeFigure(){
  console.log(this);
  console.log( this.value );
  drawFigureVar.currentView = this.value;
  reDrawFigure();
}
function reDrawFigure(){
  if( drawFigureVar.currentView == "severity"){
    drawSeverity();
  }else if ( drawFigureVar.currentView == "collision"){
    drawCollisionType();
  }else if ( drawFigureVar.currentView  == "timeofday"){
    drawTimeofDay();
  }else{
    console.log("Unknow type of selection");
  }
}

function drawSeverity(){
  // get the data
  var acc_list = homeJS.globalDataList;
  if( acc_list == undefined){
    $('#googleChartDiv').html('please select option again');
    return;
  }
  var numk = 0;
  var numa = 0;
  var numb = 0;
  var numc = 0;
  for(var i = 0;i < acc_list.length;i++){
    if(acc_list[i].num_k > 0) numk += 1;
    if(acc_list[i].num_a > 0) numa += 1;
    if(acc_list[i].num_b > 0) numb += 1;
    if(acc_list[i].num_c > 0) numc += 1;
  } 
  var tmpData = [ ['Severity', 'Number'] ];
  tmpData.push( ['K', numk] );
  tmpData.push( ['A', numa] );
  tmpData.push( ['B', numb] );
  tmpData.push( ['C', numc] );

  tmpData = google.visualization.arrayToDataTable(tmpData);
  var options = { title: 'Severity Statistics' };
  var chart = new google.visualization.PieChart(document.getElementById('googleChartDiv'));
  chart.draw(tmpData, options);
}

function drawCollisionType(){
  var acc_list = homeJS.globalDataList;
  var event2num = [];
  for(var i = 0; i< acc_list.length;i++){
    for(var j = 0; j < acc_list[i].events.length;j++){
      if( !( acc_list[i].events[j] in event2num ))
        event2num[ acc_list[i].events[j] ] =0;
      event2num[ acc_list[i].events[j] ] += 1;
    }
  }
  // sort
  var tmpData = []
  for( var k in event2num ){
    tmpData.push([accCode.event[k], event2num[k]]);
  }
  tmpData.sort(function(a,b){return b[1] - a[1];})
  tmpData.splice(0,0,  ['Collision Type', 'Number' ]);
  tmpData = google.visualization.arrayToDataTable(tmpData);
  var options = { title: 'Collision Type Statistics' };
  var chart = new google.visualization.PieChart(document.getElementById('googleChartDiv'));
  chart.draw(tmpData, options);

}

function drawTimeofDay(){
  // draw the time of day here
  var acc_list = homeJS.globalDataList;
  //var dataArray = [['caseno','timeofday']]
  var dataArray = [];
  for( var i = 0;i < acc_list.length;i++){
    var h = Math.floor(acc_list[i].n_time/3600);
    var m = Math.floor( acc_list[i].n_time%3600/60 );
    var s = Math.floor( acc_list[i].n_time % 60);
    //dataArray.push([acc_list[i].caseno, [h, m, s]]);
    dataArray.push([ [h, m, s]]);
  } 
  var tmpData = new google.visualization.DataTable();
  //tmpData.addColumn('number', 'caseno');
  tmpData.addColumn('timeofday', 'Time of Day');
  tmpData.addRows( dataArray );
  /*
  var options = google.charts.Bar.convertOptions({
    title: 'Time of Day Statistics'});
  var chart = new google.charts.Bar(document.getElementById('googleChartDiv'));
  */
  var options = {
    title: 'Time of Day Statistics'
  };
  var chart = new google.visualization.Histogram(document.getElementById('googleChartDiv'));
  chart.draw(tmpData, options);
}

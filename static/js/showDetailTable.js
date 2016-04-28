/*
 * create by sumeet
 * complete by xing
 * refactorize, move the column name, type as common variable, add log to row selection and column sorted
 * */

detailViewData = {
  lastSelectCaseno: undefined,
  table: undefined,  // google table view
  data : undefined,   // google data 

  acc_column_list : ['Caseno', 'date', 'time', 'road surface','Alcohol Flag', 'Light', 'Driver Gender', 'Location Type','Driver age', 'NumK', 'NumA', 'NumB', 'NumC'],
  acc_type_list : ['number', 'date', 'timeofday', 'string', 'string', 'string', 'string', 'string', 'string', 'number', 'number', 'number', 'number'],

  // additional information to be shown here
  new_acc_column_list : ['animal', 'rear-end', 'head-on', 'bicycle', 'pedestrian'],
  new_acc_type_list : ['boolean', 'boolean', 'boolean', 'boolean', 'boolean'],
  
  road_column_list : ['Route Number', 'Begin Milepost', 'End Milepost', 'Accident Num'],
  road_type_list : ['string', 'number', 'number', 'number']
}

function createAccData(acc_list){
  var data = new google.visualization.DataTable();

  var name_list = detailViewData.acc_column_list;
  var type_list = detailViewData.acc_type_list;
  name_list = name_list.concat( detailViewData.new_acc_column_list );
  type_list = type_list.concat( detailViewData.new_acc_type_list );

  for( var i = 0;i < name_list.length;i++){
    data.addColumn(type_list[i], name_list[i]);
  }

  for(var i = 0;i < acc_list.length;i++){
    // the format of the date / time
    //https://developers.google.com/chart/interactive/docs/reference#methods
    var date_comps = acc_list[i].acc_date.split('/');
    var h = Math.floor(acc_list[i].n_time/3600);
    var m = Math.floor( acc_list[i].n_time%3600/60 );
    var s = Math.floor( acc_list[i].n_time % 60);
    var tmpRow = [
        acc_list[i].caseno,
        new Date(parseInt(date_comps[2]), parseInt(date_comps[0]), parseInt(date_comps[1])), 
        [h, m, s, 0],
        //{v: acc_list[i].acc_date,  f: acc_list[i].n_acc_date},
        //{v: acc_list[i].time, f: acc_list[i].n_time }, 
        accCode.rdsurf[acc_list[i].rdsurf],
        acc_list[i].alcflag,
        accCode.light[acc_list[i].light],
        accCode.drv_sex[acc_list[i].drv_sex],
        accCode.loc_type[acc_list[i].loc_type],
        acc_list[i].drv_age,
        acc_list[i].num_k,
        acc_list[i].num_a,
        acc_list[i].num_b,
        acc_list[i].num_c
        ];

    // part 2 the colision type
    var is_animal =  ($.inArray(accCodeEnum.event.Animal,acc_list[i].events) >= 0 );
    var is_rear_end = ($.inArray(accCodeEnum.event.RearEndSlowOrStop, acc_list[i].events) >= 0 ) || ($.inArray(accCodeEnum.event.RearEndTurn, acc_list[i].events)>=0 ) ;
    var is_head_on =  ($.inArray(accCodeEnum.event.HeadOn, acc_list[i].events) >= 0);
    var is_bicycle = ( $.inArray(accCodeEnum.event.PedalCyclist, acc_list[i].events) >= 0);
    var is_pedestrian = ($.inArray(accCodeEnum.event.Pedstrian, acc_list[i].events) >= 0);

    var tmpRow2 = [ is_animal, is_rear_end, is_head_on, is_bicycle, is_pedestrian ];
    tmpRow = tmpRow.concat(tmpRow2);
    data.addRow( tmpRow );
  }
  return data;
}

function createSegData(seg_list){
  var acc_list = seg_list;
  var data = new google.visualization.DataTable();
  var name_list = detailViewData.road_column_list;
  var type_list = detailViewData.road_type_list;

  for( var i = 0;i < name_list.length;i++){
    data.addColumn(type_list[i], name_list[i]);
  }
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
  return data;
}


function rowSelectCB() {  
  var acc_list = homeJS.globalDataList;
  
  var row = detailViewData.table.getSelection()[0].row;
  console.log('You selected ' + detailViewData.data.getValue(row, 0));
  // TODO
  // if any marker/polyline is currently selected
  // destroy the effect first

  if( homeJSLocal.visualModeToApply == 'markers'){
    // TODO, need to merge Yue's code
    var caseno = detailViewData.data.getValue(row, 0);
    if( detailViewData.lastSelectCaseno == caseno){
      return;
    }

    add_record_refined({
      "action":"detailRowClicked", 
      "caseno": caseno
    });

    for( var i = 0;i < homeJS.onscreenMarker.length;i++){
      if( homeJS.onscreenMarker[i].accidentID == 
          detailViewData.lastSelectCaseno){
        console.log("remove effet on old one");
        homeJS.onscreenMarker[i].setMap(null);
        homeJS.onscreenMarker[i] = new google.maps.Marker({
          position: new google.maps.LatLng(acc_list[i].lat, acc_list[i].lng), 
          map: homeJSLocal.map,
          icon: getAccidentIcon(acc_list[i]),
          accidentID: detailViewData.lastSelectCaseno
        });
        var infoWindow = new google.maps.InfoWindow();
        makeAccInfowindowEvent(
            map, 
            infoWindow, 
            get_acc_details(acc_list[i]),
            homeJS.onscreenMarker[i]);
      }

      if( homeJS.onscreenMarker[i].accidentID ==  caseno){
        console.log("add animation to new one");
        homeJS.onscreenMarker[i].setMap(null);
        homeJS.onscreenMarker[i] = new google.maps.Marker({
          position: new google.maps.LatLng(acc_list[i].lat, acc_list[i].lng), 
          //animation: google.maps.Animation.DROP,
          animation: google.maps.Animation.BOUNCE,
          map: homeJSLocal.map,
          icon: getAccidentIcon(acc_list[i]),
          accidentID: caseno
        });
        var infoWindow = new google.maps.InfoWindow();
        makeAccInfowindowEvent(
            map, 
            infoWindow, 
            get_acc_details(acc_list[i]),
            homeJS.onscreenMarker[i]);
      }
    }
    // update the last select
    detailViewData.lastSelectCaseno = caseno;
  }else{
    console.log("TODO polyline view mode not supported yet");
    // for polygon, change the line width
  }
}

function columnSortedCB(){
  sortInfo = detailViewData.table.getSortInfo();
  add_record_refined({
    'action': 'columnSorted',
    'sortInfo' : {
      'columnName': detailViewData.acc_column_list[sortInfo.column], 
      'ascending': sortInfo.ascending
    }
  });
}

function drawTableEvent() {
  // update by Xing, 4/22,  plot the actual data instead of the dummy data.
  // the datatable should be updated when the map is moved. 

  google.charts.setOnLoadCallback(drawTable);
  function drawTable() {
    // TODO, also need to update the table when the region is selected as polygon
    // The createXXXData function need to be changed
    if(homeJSLocal.visualModeToApply == "segments"){
      detailViewData.data = createSegData(homeJS.globalDataList);
    }else{ 
      detailViewData.data = createAccData(homeJS.globalDataList);
    }

    detailViewData.table = new google.visualization.Table(document.getElementById('table_div'));
    google.visualization.events.addListener(detailViewData.table, 'select', rowSelectCB);
    google.visualization.events.addListener(detailViewData.table, 'sort', columnSortedCB);
    detailViewData.table.draw(detailViewData.data, {
      showRowNumber: true, 
      width: '100%', 
      height: '40%',
      cssClassNames: {headerCell: "googleTableHeaderCell"}
    }); 
    
    //$(".googleTableHeaderCell"), add hover function to it. 
    $(".googleTableHeaderCell").mouseover(function(){console.log(this.innerText); });
    
  }
}



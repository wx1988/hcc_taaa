/*
first part, information visualization.
- show graph
- show all nodes to click on, nodes of different types

second part, interaction.
- add new link,
- remove existing link

*/

window.onload = function(){
    // use ajax call to get all the information
    var caseno_val = urlParam('caseno');

    // get raw meta data nodes
    jQuery.post(
        "/view_accident_raw",
        {"caseno":caseno_val},
        get_accident_cb,
        "json");

    /*
    // for debug
    .done(function() {
        alert( "second success" );
      })
      .fail(function() {
        alert( "error" );
      })
      .always(function() {
        alert( "finished" );
    });
    */

    // get existing links

}

function get_accident_cb(data){
    console.log(data);
    if(data.status != 0){
        alert(data.data);
        return;
    }

    //
    jQuery("#showinfo").html(data.data);
}

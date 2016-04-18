/*
first part, information visualization.
- show graph
- show all nodes to click on, nodes of different types

second part, interaction.
- add new link,
- remove existing link

*/
acc_info = null;
links_info = null;
user_info = null;

window.onload = function(){
    // use ajax call to get all the information
    var caseno_val = urlParam('caseno');
    render_accident_by_caseno(caseno_val);

    // get existing links
}

function render_accident_by_caseno(caseno_val){
    acc_info = null;
    links_info = null;
    user_info = null;

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

    // get current links
    jQuery.post(
        "/get_links",
        {"caseno":caseno_val},
        get_links_cb,
        "json");

    jQuery.post(
        "/get_user_info",
        {"caseno":caseno_val},
        get_user_info_cb,
        "json");

    // show the images

    // check the finish loading of accident and links
    check_acc_links_load();
}

function get_accident_cb(data){
    console.log(data);
    if(data.status != 0){
        alert(data.data);
        return;
    }

    //jQuery("#showinfo").html(data.data);
    //render_accident_blocks(data.data);
    acc_info = data.data;
}

function get_links_cb(data){
    console.log(data);
    if(data.status != 0){
        alert(data.data);
        return;
    }

    links_info = data.data;
}

function get_user_info_cb(data){
    console.log(data);
    if(data.status != 0){
        alert(data.data);
        return;
    }

    user_info = data.data;
}

function check_acc_links_load(){
    if( acc_info == null || links_info == null || user_info == null){
        setTimeout(check_acc_links_load, 500);
    }else{
        var caseno_val = urlParam('caseno');

        render_accident_blocks(acc_info);
        render_links(links_info);
        render_image(caseno_val, user_info.id);
    }

}

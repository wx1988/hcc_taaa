// There is a state machine
// start, firstnode, secondnode
link_state = "start";
firstnode = null;
secondnode = null;


function node_click(node_name){
    if(link_state == "start"){
        firstnode = node_name;
        link_state = 'firstnode';
    }else if(link_state == "firstnode"){
        secondnode = node_name;
        //link_state = "secondnode";
        link_state = "start";
        // upload this link

    }else{
        alert("Unknow state "+link_state);
    }
}


function create_link_cb(data){
    // callback of create link function
}


function change_link_type(link_id, link_type){
    // update
}


function remove_link(link_id){
    // remove existing link
}

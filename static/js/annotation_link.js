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
        console.log("First node: "+firstnode);
        console.log("Second node: "+secondnode);

        // send requrest
        var caseno = urlParam('caseno');
        jQuery.post(
            '/add_causal_link',
            {'caseno':caseno,
            'from_node':firstnode,
            'to_node':secondnode,
            'node_type':'cause'},
            create_link_cb,
            'json');
    }else{
        alert("Unknow state "+link_state);
    }
}


function create_link_cb(data){
    // callback of create link function
    console.log(data);

    // rerender
    var caseno_val = urlParam('caseno');
    render_accident_by_caseno(caseno_val);
}


function change_link_type(link_id, link_type){
    // update
}


function remove_link(link_id){
    // remove existing link
}

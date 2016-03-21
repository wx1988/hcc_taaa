/////////////////
// Raw data part
/////////////////
function gen_block(acc_block){
    var tpl = "<div><h4>{0}</h4><div>{1}</div></div>";
    var title = acc_block.type;
    if(acc_block.index != undefined)
        title += acc_block.index;

    var attrs = acc_block.attributes;
    var tmp_str = "";
    //var node_tpl = "<a href='#' onclick='node_click(\"{0}\");'>{2}:{1}</a><br/>";
    var node_tpl = "";
    node_tpl += "<div class='row'>";
    node_tpl += "<div class='col-sm-4'>{0}</div>";
    node_tpl += "<div class='col-sm-5'><a href='#' onclick='node_click(\"{0}\");'>{1}</a></div>";
    node_tpl += "<div class='col-sm-3'>{2}</div>";
    node_tpl += "</div>";

    for(var i= 0;i < attrs.length;i++){
        tmp_str += String.format(node_tpl,
            attrs[i].key, attrs[i].value, "TODO");
    }

    var res = String.format(tpl, title, tmp_str);
    return res;
}

function render_accident_blocks(acc_blocks){
    // render an interactive accident

    // TODO, based on current links, show feed back on links

    // rendering each block
    var tmp_str = "";
    for(var i=0;i < acc_blocks.length;i++){
        tmp_str += gen_block(acc_blocks[i]);
    }

    jQuery("#showinfo").html(tmp_str);
}


/////////////////
// Link feed back part
/////////////////
function render_links(links){
    var link_row_tpl = "";
    link_row_tpl += "<div class='row'>";
    link_row_tpl += "<div class='col-sm-5'>{0}</div>";
    link_row_tpl += "<div class='col-sm-5'>{1}</div>";
    link_row_tpl += "<div class='col-sm-2'>{2}</div>";
    link_row_tpl += "</div>";

    var link_str = "";
    for(var i=0;i < links.length;i++){
        var tmp_str = String.format(
            link_row_tpl,
            links[i].from_node,
            links[i].to_node,
            links[i].node_type);
        link_str += tmp_str;
    }
    jQuery("#buildlink").html(link_str);
}



/////////////////
// Graph visualization of causal links
/////////////////

function render_image(caseno, uid){
    var img_url_tpl = "/static/imgs/tmp/{0}-{1}.png";
    var img_url = String.format(img_url_tpl, caseno, uid);

    var tmp_str_tpl = "<img src='{0}' style='height:auto;'/>";
    var tmp_str = String.format(tmp_str_tpl, img_url);

    jQuery('#cgraph').html(tmp_str);
}

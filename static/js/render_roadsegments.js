function render_roadsegments(map, roadsegments)
{
  for(var i = 0; i < roadsegments.length; ++i)
  {
    var plist = roadsegments[i].plist;
    var localCoords = [];

    for(var j = 0; j < plist.length; j++)
    {
      localCoords[j] = {lat: plist[j][1], lng:plist[j][0]};
    }

    var acc_num = 0;
    if(roadsegments[i].casenolist != undefined)
    {
      acc_num =roadsegments[i].casenolist.length;
    }

    var localColor = HSVtoRGB( sigmoid(acc_num), 1, 1);
    var segment = new google.maps.Polyline({
      path: localCoords
        ,geodesic: true
        ,strokeColor: localColor
        ,strokeOpacity: 1.0
        ,strokeWeight: 1 + sigmoid(acc_num)
    });
    segment.setMap(map);

    with ({tseg: roadsegments[i]})
    {
      segment.addListener('click'
          , function(){
            do_log(tseg);
          });
    }
  }
}

function sigmoid(t)
{
  // re-scaled illustration
  return 1/(1+Math.pow(Math.E, -0.1*t));
}

function decimalToHex(d, padding)
{
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding)
  {
    hex = "0" + hex;
  }
  return hex;
}

function HSVtoRGB(h, s, v)
{
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1)
  {
    s = h.s, v = h.v, h = h.h;
  }

  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6)
  {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return "#" + decimalToHex(Math.round(r * 255)) + decimalToHex(Math.round(g * 255)) + decimalToHex(Math.round(b * 255));
}

// This function will render the segments 
// You could follow the template/segs_demo.html
// When each segment is clicked, there will be a popup showing the information about the segments.

// map, javascript map variable to show the segment
// roadsegments, list of road segments
// Example: 
/*
   {
   "rodwycls": "08", 
   "lshl_typ": "06", 
   "terrain": "1", 
   "bound": {"down": 34.993755374310105, "top": 35.000532882557636, "right": -78.08931884788728, "left": -78.09195681900657}, 
   "rshldwid": 0.0, 
   "id": "570815bae0f0456756a8a71f", 
   "yr_impr1": "1988-12-31 00:00:00", 
   "plist": [[-78.08931884788728, 34.993755374310105], [-78.089578586, 34.994433079], [-78.090038439, 34.9956429430001], [-78.090489162, 34.9967743400001], [-78.0909961359999, 34.998103373], [-78.0915046929999, 34.999366632], [-78.0915046929999, 34.999366632], [-78.091720086, 34.999891969], [-78.0918854289999, 35.0003387240001], [-78.09195681900657, 35.000532882557636]], 
   "surf_typ": "63", 
   "yradd": "1901-12-31 00:00:00", 
   "rshl_typ": "06", 
   "begmp": 20.163, 
   "spd_limt": "35", 
   "rte_nbr": "20000117", 
   "medwid": 0.0, 
   "aadt": 3800.0, 
   "med_type": "0", 
   "casenolist": [103201618.0, 103395223.0, 103553310.0, 103553311.0, 104044290.0], 
   "cntyrte": "3020000117", 
   "surf_wid": 42.0, 
   "lshldwid": 0.0, 
   "endmp": 20.650000000000002} 
   */

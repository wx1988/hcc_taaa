import numpy as np

# PAGE 64
weather = {
    0:"Not Stated",
    1:"Clear",
    2:"Cloudy",
    3 :"Rain",
    4 :"Snow",
    5 :"Fog, Smog, Smoke",
    6 :"Sleet, Hall, Freezing Rain/Drizzle",
    7 :"Severe Crosswinds",
    8 :"Blowing Sand, Dirt, Snow",
    9 :"Other"
}

# page 42
light = {
    0 :"Not Stated (Pre 2000)",
    1 :"Daylight",
    2 :"Dusk",
    3 :"Dawn",
    4 :"Dark, Lighted Roadway",
    5 :"Dark, Roadway Not Lighted",
    6 :"Dark, Unknown Lighting",
    7 :"Other",
    8 :"Unknown"
}

#roadsurf, page 54
rdsurf = {
    0 :"Not Stated",
    1 :"Dry",
    2 :"Wet",
    3 :"Water (Standing, Moving)",
    4 :"Ice",
    5 :"Snow",
    6 :"Slush",
    7 :"Sand, Mud, Dirt, Gravel",
    8 :"Fuel, Oil",
    9 :"Other",
    10 :"Unknown"
}


def replace_acc_coding(acc):
    if not np.isnan(acc['weather1']):
        acc['weather1'] = weather[ acc['weather1'] ]
    if not np.isnan(acc['weather2']):
        acc['weather2'] = weather[ acc['weather2'] ]
    if not np.isnan(acc['rdsurf']):
        acc['rdsurf'] = rdsurf[ acc['rdsurf'] ]
    if not np.isnan(acc['light']):
        acc['light'] = light[ acc['light'] ]
    return acc

# sob test, TODO, only the test done, not the results of the test

#
contrib = {
    0 :"No Contributing Factors",
    1 :"Disregarded Yield Sign",
    2 :"Disregarded Stop Sign",
    3 :"Disregarded Other Traffic Signs",
    4 :"Disregarded Traffic Signals",
    5 :"Disregarded Road Signals",
    6 :"Exceeded Authorized Speed Limit",
    7 :"Exceeded Safe Speed for Conditions",
    8 :"Failure to Reduce Speed",
    9 :"Improper Turn",
    10 :"Right Turn on Red",
    11 :"Crossed Center Line/Going Wrong Way",
    12 :"Improper Lane Change",
    13 :"Use of Improper Lane",
    14 :"Overcorrected/Oversteered",
    15 :"Passed Stopped School Bus",
    16 :"Passed on Hill",
    17 :"Passed on Curve",
    18 :"Other Improper Passing",
    19 :"Failed to Yield Right of Way",
    20 :"Inattention",
    21 :"Improper Backing",
    22 :"Improper Parking",
    23 :"Driver Distracted",
    24 :"Improper or No Signal",
    25 :"Followed Too Closely",
    26 :"Operated Vehicle in Erratic, Reckless, Careless, Negligent or Aggressive Manner",
    27 :"Swerved or Avoided Due to Wind, Slippery Surface, Vehicle, Object, NonMotorist",
    28 :"Visibility Obstructed",
    29 :"Operated Defective Equipment",
    30 :"Alcohol Use",
    31 :"Drug Use",
    32 :"Other",
    33:"Unable to Determine",
    34:"Unknown",
    35:"Not Stated (Pre 2000)",
    36:"Minimum Speed Law (Pre 2000)",
    37:"Safe Movement Violation (Pre 2000)"
}

event = {
    0 :"Unknown",
    1 :"Ran off Road Right",
    2 :"Ran Off Road Left",
    3 :"Ran Off Road Straight Ahead",
    4 :"Jackknife",
    5 :"Overturn/Rollover",
    6 :"Crossed Centerline/Median",
    7 :"Downhill Runaway",
    8 :"Cargo/Equipment Loss or Shift",
    9 :"Fire/Explosion",
    10 :"Immersion",
    11 :"Equipment Failure",
    12 :"Separation of Units",
    13 :"Other Non-Collision",
    14 :"Pedestrian",
    15 :"Pedalcyclist",
    16 :"RR Train, Engine",
    17 :"Animal",
    18 :"Movable Object",
    20 :"Parked Motor Vehicle",
    21 :"Rear End, Slow or Stop",
    22 :"Rear End, Turn",
    23 :"Left Turn, Same Roadways",
    24 :"Left Turn, Different Roadways",
    25 :"Right Turn, Same Roadways",
    26 :"Right Turn, Different Roadways",
    27 :"Head On",
    28 :"Sideswipe, Same Direction",
    29 :"Sideswipe, Opposite Direction",
    30 :"Angle",
    31 :"Backing Up",
    32 :"Other Collision with Vehicle",
    33 :"Tree",
    34 :"Military Route",
    35 :"Luminaire Pole Non-Breakaway",
    36 :"Luminaire Pole Breakaway",
    37 :"Official Highway Sign Non-Breakaway",
    38 :"Official Highway Sign Breakaway",
    39 :"Overhead Sign Support",
    40 :"Commercial Sign",
    41 :"Guardrail End on Shoulder",
    42 :"Guardrail Face on Shoulder",
    43 :"Guardrail End on Median",
    44 :"Guardrail Face on Median",
    45 :"Shoulder Barrier End",
    46 :"Shoulder Barrier Face",
    47 :"Median Barrier End",
    48 :"Median Barrier Face",
    49 :"Bridge Rail End",
    50 :"Bridge Rail Face",
    51 :"Overhead Part Underpass",
    52 :"Pier on Shoulder of Underpass",
    53 :"Pier in Median of Underpass",
    54 :"Abutment of Underpass",
    55 :"Traffic Island Curb or Median",
    56 :"Catch Basin or Culvert on Shoulder",
    57 :"Catch Basin or Culvert on Median",
    58 :"Ditch",
    59 :"Embankment",
    60 :"Mailbox",
    61 :"Fence or Fence Post",
    62 :"Construction Barrier",
    63 :"Crash Cushion",
    64 :"Other Fixed Object",
}

def replace_veh_coding(veh):
    for k in veh.keys():
        if k.startswith('contrib'):
            if not np.isnan(veh[k]):
                veh[k] = contrib[veh[k]]
        if k.startswith('event'):
            if not np.isnan(veh[k]):
                veh[k] = event[veh[k]]
    return veh

loc_type = {
    0 :"No Feature",
    1 :"Bridge",
    2 :"Bridge Approach",
    3 :"Underpass",
    4 :"Driveway, Public",
    5 :"Driveway, Private",
    6 :"Alleyway Intersection",
    7:"Four-Way Intersection",
    8:"T-Intersection",
    9:"Y-Intersection",
    10:"Traffic Circle/Roundabout",
    11:"Five Point or More",
    12:"Related to Intersection",
    13 :"Non-Intersection Median Crossing",
    14 :"End or Beginning Divided Highway",
    15:"Off Ramp Entry",
    16:"Off Ramp Proper",
    17:"Off Ramp Terminal on Crossroad",
    18:"Merge Lane Between On and Off Ramp",
    19:"On Ramp Entry",
    20:"On Ramp Proper",
    21:"On Ramp Terminal on Crossroad",
    22 :"Railroad Crossing",
    23 :"Tunnel",
    24 :"Shared Use Path or Trails",
    25 :"Other",
    26:"Not stated (Pre 2000)",
    27:"Intersection of Roadway (Pre 2000)",
    28:"Interchange Ramp (Pre 2000)",
    29:"Interchange Service Road (Pre 2000)"
}

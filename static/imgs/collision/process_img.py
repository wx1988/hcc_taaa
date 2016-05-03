"""
Remove white part of the image to make it transparent
Create four color, black, red, orange, green to indicate accident of different severity.
"""
import os
from PIL import Image
import colorsys

def create_transparent_4grade(img_path, out_path, fill_color=None):
    """Change white as transparent, and black as fill_color
    :param img_path: original image
    :param out_path: output path
    :param fill_color: the color to replace the black
    """
    img = Image.open(img_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        #print item
        #if item[0] == 255 and item[1] == 255 and item[2] == 255:
        if img_path.count('dear') > 0:
            thres = 50
        else:
            thres = 200
        if (item[0] > thres and item[1] > thres and item[2] > thres) or item[3] == 0:
            # transparent
            newData.append((255, 255, 255, 0))
        else:

            if fill_color == None:
                newData.append( item )
            else:
                newData.append( fill_color )

    img.putdata(newData)
    img.save(out_path, "PNG")

def get_color(hue):
    """TODO, not working well
    """
    #color = colorsys.hsv_to_rgb(hue, 237.0/255, 169.0/255)
    color = colorsys.hls_to_rgb(hue, 169.0/255, 237.0/255)
    return (int(color[0]*255), int(color[0]*255), int(color[0]*255), 255)

if __name__ == '__main__':
    #do_it("head_on.png", "head_on_transparent.png")
    # TODO, lower the saturation here

    fill_color_list = [
        (0,0,0,255),
        (254, 117, 105, 255),# from google marker icon
        (246, 156,85,255),# from stackoverflow
        (52, 186, 70, 255)# from google marker icon
        ]

    print fill_color_list
    name_list = ['black', 'red', 'orange', 'green']
    img_name_list = ['dear', 'head_on', 'rear_end', 'bicycle', 'pedestrian']
    for img_name in img_name_list:
        for i in range(4):
            org_size_name = img_name+"_"+name_list[i]+".png"
            reduce_size_name = img_name+"_"+name_list[i]+"_50p.png"
            create_transparent_4grade(
                    img_name+".png",
                    org_size_name,
                    fill_color_list[i])
            os.system( 'convert {0} -resize 60% {1}'.format(org_size_name, reduce_size_name) )


"""
Remove white part of the image to make it transparent
Create four color, black, red, orange, green to indicate accident of different severity.
"""
import os
from PIL import Image

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


if __name__ == '__main__':
    #do_it("head_on.png", "head_on_transparent.png")

    fill_color_list = [
        (0,0,0,255),
        (254, 117, 105, 255),# from google marker icon
        (246, 156,85,255),# from stackoverflow
        (52, 186, 70, 255)# from google marker icon
        ]
    name_list = ['black', 'red', 'orange', 'green']
    img_name_list = ['red_cross_12']
    for img_name in img_name_list:
        for i in range(4):
            org_size_name = "cross_12_"+name_list[i]+".png"
            create_transparent_4grade(
                    img_name+".png",
                    org_size_name,
                    fill_color_list[i])


"""
Remove white part of the image to make it transparent
Create four color, black, red, orange, green to indicate accident of different severity. 
"""
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
        thres = 200
        if item[0] > thres and item[1] > thres and item[2] > thres:
            newData.append((255, 255, 255, 0))
        else:
            if fill_color == None:
                newData.append(item)
            else:
                newData.append(fill_color)

    img.putdata(newData)
    img.save(out_path, "PNG")


if __name__ == '__main__':
    #do_it("head_on.png", "head_on_transparent.png")
    fill_color_list = [None, (255,0,0,255), (255,127,0,255),(0,255,0,255)]
    name_list = ['black', 'red', 'yellow', 'green']
    img_name_list = ['head_on', 'rear_end', 'bicycle', 'pedestrain']
    for img_name in img_name_list:
        for i in range(4):
            create_transparent_4grade(
                    img_name+".png", 
                    img_name+"_"+name_list[i]+".png", 
                    fill_color_list[i])



import fiona
from shapely import geometry



def get_LGA(point, location):

    for x_coord in location.keys():
        xmin = x_coord[0]
        xmax = x_coord[1]
        if point.x > xmin and point.x < xmax:
            y_coord = location[x_coord].keys()[0]
            ymin = y_coord[0]
            ymax = y_coord[1]
            if point.y > ymin and point.y < ymax:
                return location[x_coord][y_coord]

    return None, None

def get_LGA_dict(shapefile):

    location = {}

    with fiona.open(shapefile) as collection:

        for shapefile_record in collection:
            shape = geometry.asShape( shapefile_record['geometry'] )

            minx, miny, maxx, maxy = shape.bounds
            bounding_box = geometry.box(minx, miny, maxx, maxy)
            location[(minx,maxx)] = {(miny,maxy): (shapefile_record['properties'], shapefile_record['geometry'])}

    return location


# -*- coding: utf-8 -*-
#----------------------------------------------------- ---------------------------------------------------------
#
# 										INCLUDE SECTION
#
# --------------------------------------------------------------------------------------------------------------
import sys, os
import ConfigParser
import traceback
import tweepy
import json
import couchdb
import time
import json
from datetime import datetime
from textblob import TextBlob
import time
import re
import assign_LGA as lga
from shapely import geometry
#----------------------------------------------------- ---------------------------------------------------------
#
# 										CONFIGURATION SETTINGS
#
# --------------------------------------------------------------------------------------------------------------


user = "admin"
password = "admin"
SERVER = couchdb.Server("http://%s:%s@localhost:5984/" % (user, password))
dbname = 'data'
shapefile = './shapefiles/shapefile.shp' 


#Use for Node 2:
CONSUMER_TOKEN = 'QF1tGwrTRiJeaULcWK9ZcQVej'
CONSUMER_SECRET = '3a3dh8Cmqki8jsZUpcTGtGMqzLhtX4zgeh89NYLsTm5vT6NNVb'
ACCESS_TOKEN = '989347095487250434-NaihmIIY9jv1PymmNiaLvwMZu221VV9'
ACCESS_SECRET = '4RpYaw55X4CDfIfH8vevwbiyYwrVToOguXzz0l8d6M4kJ'
#For Victoria East
boundryBox = [140.9617,-39.1832,143.98,-33.9806]

'''
#Use for ubuntu3:
CONSUMER_TOKEN = 'GZT4luK88Yd49P4qntWzKkiEZ'
CONSUMER_SECRET = '01iwOqgRpogKMOg2Lz5lq8lsthYh7iT2A1hJ0cqyNYugqPwLEE'
ACCESS_TOKEN = '989348971616223232-xkgtX2djTV4yAHMdf2ul8N2lPos7cMY'
ACCESS_SECRET = '4CGnsJmVpOyUk2kSbKQIcjfv4gTws4aAk0TefCBn1xC6m'
#For Victoria middle
boundryBox = [143.99,-39.1832,147,-33.9806]
'''
'''
#Using for Node 4
CONSUMER_TOKEN = 'V92lZNeClH0PlgGV1z5OUnG0A'
CONSUMER_SECRET = 'lPpRXZOjjlg1t2ZbtRuTQhaLS7JHl33eTfiUsXbDigw6AFKzLF'
ACCESS_TOKEN = '991213342067834881-qLTv5mi3yT1CfIuXzf3Hd3a5eJ5VOOz'
ACCESS_SECRET = 'yDfZj8IuGOF6czuFAkacCEYt1F3WQyevKDqDhQQJM8fHr'
#For Victoria West
boundryBox = [147.1,-39.1832,150.017,-33.9806]
'''

xlow = 140.9617
xhigh = 150.017
ylow = -39.1832
yhigh = -33.9806

#For melbourne
#boundryBox = [144.5937,-38.4339,145.5125,-37.5113]
#For Victoria
#boundryBox = [140.9617,-39.1832,150.017,-33.9806]
#For Australia
#boundryBox = [110.951034,-54.833766,159.287222,-9.187026]

#----------------------------------------------------- ---------------------------------------------------------
#
# 										MAIN PROGRAM
#
# --------------------------------------------------------------------------------------------------------------

try:
    db = SERVER[dbname]
    print ("opened",dbname)
except couchdb.ResourceNotFound:
    print ("creating db",dbname)
    db = SERVER.create(dbname)


def get_trace():
    return ''.join(traceback.format_exception(*sys.exc_info()))        

class CustomStreamListener(tweepy.StreamListener):
    
    def __init__(self):
        tweepy.StreamListener.__init__(self)

        
    def process_status(self, status):
        global db # couchdb (global)
        global location # The location of the shapefile polygons.
        try:
            # skip retweets
            if status.retweet_count:
                return True

            # skip if already in couch
            if status.id_str in db:
                return True
            
            if status.coordinates == None:
                return True
            coordinates = status.coordinates['coordinates']
            #Skip if the tweets on the timeline is outside of the boundry box.
            if  xlow > coordinates[0] > xhigh or  ylow > coordinates[1] > yhigh:
                return True
                
            results = {}
            # status info. See: https://gist.github.com/dev-techmoe/ef676cdd03ac47ac503e856282077bf2
            results['text']=status.text.lower()
            results['orig_text']=status.text
            results['id_str']=status.id_str
            sentiment = TextBlob(status.text)
            results['sentiment'] = sentiment.sentiment.polarity
            #print("Does it fail here: 0 ")
            results['properties'], useless = lga.get_LGA(geometry.Point(coordinates),location)
            if results['properties'] == None:
                return True
            results['created_at'] = time.mktime(status.created_at.utctimetuple())
            results['entities'] = status.entities # urls, hashtags, mentions,
            results['source'] = status.source
            results['coordinates'] = status.coordinates
            results['retweet_count'] = status.retweet_count
            results['retweeted'] = status.retweeted
            # user info
            results['user'] = {}
            results['user']['screen_name']=status.author.screen_name
            results['user']['name']=status.author.name
            results['user']['id']=status.author.id_str
            results['user']['url']=status.author.url
            results['user']['location']=status.author.location
            results['user']['statuses_count']=status.author.statuses_count
            results['user']['lang']=status.author.lang
            results['user']['description']=status.author.description
            results['user']['geo_enabled']=status.author.geo_enabled
            results['user']['verified']=status.author.verified

            # store in db
            db[results['id_str']] = results

        except Exception as ex:
            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
            message = template.format(type(ex).__name__, ex.args)
            print message
            pass

        return True

    def get_timeline(self,name):

        global api
        oldest = None
        count = 200
        while count >= 199:
            count = 1
            for current in tweepy.Cursor(api.user_timeline, screen_name = name, count = 200,max_id = oldest).items(200):
                count += 1
                self.process_status(current)
                oldest = current.id -1
                
    def on_status(self, status):
        # skip retweets
        if status.retweet_count:
            return True
        
        # skip if already in couch
        if status.id_str in db:
            return True
        
        if status.coordinates == None:
            return True

        if status.user.screen_name != None:
            self.get_timeline(status.user.screen_name)
                       
        return True
    
    def on_delete(self, status_id, user_id):
        print ('Got DELETE message:', status_id, user_id)
        return True # Don't kill the stream
        
    def on_limit(self, track):
        """Called when a limitation notice arrvies"""
        print ('Got Rate limit Message', str(track))
        return True # Don't kill the stream

    def on_error(self, status_code):
        print ('Encountered error with status code:', status_code)
        if status_code == 420:
            print("I will sleep for 15 minuntes to avoid being blacklisted")
            time.sleep(60 * 15) # sleep for 15 minutes
        return True # Don't kill the stream

    def on_timeout(self):
        print ('Timeout...')
        return True # Don't kill the stream
    
    def on_stall_warning(self, status):
        print ("Got Stall Warning message",str(status))
        return True # Don't kill the stream
        
try:
    # my config is hard coded
    auth = tweepy.OAuthHandler(CONSUMER_TOKEN, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
    api = tweepy.API(auth)
    location = lga.get_LGA_dict(shapefile)
    print("Ready! ")

    while True:
        try:
            streaming_api = tweepy.streaming.Stream(auth, CustomStreamListener(), timeout = 60, secure = True)
            streaming_api.filter(locations = boundryBox)
        except Exception, ex:
            err =  "'%s' '%s' Error '%s' '%s'"%(dbname, str(datetime.now()), str(ex), get_trace())
            print (err)
            file('errors.txt','a').write(err+'\n')
        finally:
            print ("disconnecting...")
            streaming_api.disconnect()
            # time.sleep(60)
except KeyboardInterrupt:
    print "got keyboardinterrupt"

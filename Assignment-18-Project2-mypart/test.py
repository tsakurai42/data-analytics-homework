import json
import requests
from pprint import pprint
import pymongo
from flask import Flask, jsonify, render_template, redirect
import pandas as pd
import time
from bson import BSON
from bson import json_util

conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)
fifa_db = client.fifa
fifa_data = fifa_db.data

player_list = fifa_data.find({'Position': {'$not': {'$eq': 'GK'}}}, {'Name': 1, 'ID': 1, '_id': 0, 'LW': 1, 'ST': 1, 'RW': 1, 'LF': 1,
                                                                     'CF': 1, 'RF': 1, 'CAM': 1, 'LM': 1, 'CM': 1, 'RM': 1, 'CDM': 1, 'LWB': 1, 'RWB': 1, 'LB': 1, 'CB': 1, 'RB': 1}).limit(100)
player_id_list = {}
players = []
for player in player_list:
    player_id_list[player['ID']] = player
pprint(player_id_list)

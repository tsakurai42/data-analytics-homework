import json
import requests
from pprint import pprint
import pymongo
from flask import Flask, jsonify, render_template, redirect
import pandas as pd
import time
from bson import BSON
from bson import json_util

app = Flask(__name__)
conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)

fifa_db = client.fifa
fifa_data = fifa_db.data

# @app.route('/')
# def index():
#     main page ish

# player_data = fifa_data.find_one({'ID':158023},{'Name':1, 'LW':1,'ST':1,'RW':1,'LF':1,'CF':1,'RF':1,'CAM':1,'LM':1,'CM':1,'RM':1,'CDM':1,'LWB':1,'RWB':1,'LB':1,'CB':1,'RB':1,'_id':0})
# print(type(player_data))
# pprint(json.dumps(player_data))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/top_100_players')
def list100():
    player_list = fifa_data.find({'Position': {'$not': {'$eq': 'GK'}}}, {'Name': 1, 'ID': 1, '_id': 0, 'LW': 1, 'ST': 1, 'RW': 1, 'LF': 1,
                                                                         'CF': 1, 'RF': 1, 'CAM': 1, 'LM': 1, 'CM': 1, 'RM': 1, 'CDM': 1, 'LWB': 1, 'RWB': 1, 'LB': 1, 'CB': 1, 'RB': 1}).limit(100)
    player_id_list = {}
    players = []
    for (i, player) in enumerate(player_list):
        player_id_list[player['ID']] = i
        players.append(player)
    returnplayers = {"id_list": player_id_list, "players": players}
    return jsonify(returnplayers)

# @app.route('/top_100_players')
# def list100():
#     player_list = fifa_data.find({'Position': {'$not': {'$eq': 'GK'}}}, {'Name': 1, 'ID': 1, '_id': 0, 'LW': 1, 'ST': 1, 'RW': 1, 'LF': 1,
#                                                                          'CF': 1, 'RF': 1, 'CAM': 1, 'LM': 1, 'CM': 1, 'RM': 1, 'CDM': 1, 'LWB': 1, 'RWB': 1, 'LB': 1, 'CB': 1, 'RB': 1}).limit(100)
#     player_id_list = {}
#     # for player in player_list:
#     #     player_id_list[player['ID']] = player
#     return jsonify(player_id_list)

@app.route('/init_db')
def init_db():
    fifa_data.drop()
    csvfile = 'resources/FIFA_data.csv'
    csv_read = pd.read_csv(csvfile)
    fifa_data.insert_many(csv_read.to_dict('records'))
    return redirect('../', code=302)


if __name__ == "__main__":
    app.run(debug=True)

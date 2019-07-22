import json
import requests
import pymongo
from flask import Flask, render_template, redirect, jsonify
from pprint import pprint
import pandas as pd
import time

app = Flask(__name__)
conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)


fifa_db = client.fifa
fifa_data = fifa_db.data
fifa_country_data = fifa_db.country_data

fifa_data.drop()
fifa_country_data.drop()

csvfile = 'resources/FIFA_data.csv'
csv_read = pd.read_csv(csvfile)

country_csvfile = 'resources/countryCoords.csv'
country_read = pd.read_csv(country_csvfile)

fifa_data.insert_many(csv_read.to_dict('records'))
fifa_country_data.insert_many(country_read.to_dict('records'))


@app.route('/')
def index():

  """Return the homepage."""

  return render_template("index.html")

@app.route('/geomap')
def geomap():

    countries_list = fifa_data.find({})

    countries_list_db = pd.DataFrame(list(countries_list))[['Nationality', 'Overall']].groupby('Nationality').mean()

    countries_with_coords = fifa_country_data.find({}, {'name':1, 'latitude':1, 'longitude':1, '_id':0})

    name_list = []
    latitude_list = []
    longitude_list = []

    for country in countries_with_coords:
        name_list.append(country['name'])
        latitude_list.append(country['latitude'])
        longitude_list.append(country['longitude'])

    countries_with_coords_db = pd.DataFrame({
        'Nationality': name_list,
        'Latitude': latitude_list,
        'Longitude': longitude_list
    })

    final_db = pd.merge(countries_list_db, countries_with_coords_db, on = 'Nationality')
    final_dict = final_db.to_dict('records')


    return jsonify(final_dict)


@app.route('/top_100_players')
def list100():
    player_list = fifa_data.find({'Position':{'$not': {'$eq':'GK'}}},{'Name':1,'ID':1,'_id':0,'LW':1,'ST':1,'RW':1,'LF':1,'CF':1,'RF':1,'CAM':1,'LM':1,'CM':1,'RM':1,'CDM':1,'LWB':1,'RWB':1,'LB':1,'CB':1,'RB':1}).limit(100)
    player_id_list = {}
    players = []
    for (i, player) in enumerate(player_list):
        player_id_list[player['ID']] = i
        players.append(player)
    returnplayers = {"id_list":player_id_list, "players":players}
    return jsonify(returnplayers)


@app.route("/bar/countries")
def countries():

    countries_list = fifa_data.find({}, {'Nationality':1, '_id':0})
    
    countries_list_unique = []

    for country in countries_list:
        if country['Nationality'] not in countries_list_unique:
            countries_list_unique.append(country['Nationality'])

    countries_list_sorted = sorted(countries_list_unique)

    countries_list_final = ['Overall']

    for country in countries_list_sorted:
        countries_list_final.append(country)

    return jsonify(countries_list_final)


@app.route("/bar/Overall/<whichSort>")
def barOverall(whichSort):
    player_list = fifa_data.find({}, {'ID':1, 'Name':1, 'Photo':1, 'Nationality':1, 'Flag':1, 'Overall':1, 'Value':1, '_id':0})

    player_list_with_numeric_values = []

    for player in player_list:
        player['Value'] = player['Value'][1:]
        if 'M' in player['Value']:
            player['Value'] = float(player['Value'][:-1]) * 10**6
        elif 'K' in player['Value']:
            player['Value'] = float(player['Value'][:-1]) * 1000
        else:
            player['Value'] = float(player['Value'])
        player_list_with_numeric_values.append(player)

    player_list_sorted = sorted(player_list_with_numeric_values,key = lambda player: player[whichSort], reverse = True)[:10]
    
    players_top_ten = []

    for player in player_list_sorted:
        players_top_ten.append(player)

    return jsonify(players_top_ten)

@app.route("/bar/<country>/<whichSort>")
def bar(country, whichSort):
    player_list = fifa_data.find({'Nationality':country}, {'ID':1, 'Name':1, 'Photo':1, 'Nationality':1, 'Flag':1, 'Overall':1, 'Value':1, '_id':0})

    player_list_with_numeric_values = []

    for player in player_list:
        player['Value'] = player['Value'][1:]
        if 'M' in player['Value']:
            player['Value'] = float(player['Value'][:-1]) * 10**6
        elif 'K' in player['Value']:
            player['Value'] = float(player['Value'][:-1]) * 1000
        else:
            player['Value'] = float(player['Value'])
        player_list_with_numeric_values.append(player)

    player_list_sorted = sorted(player_list_with_numeric_values,key = lambda player: player[whichSort], reverse = True)[:10]

    players_per_country = []

    for player in player_list_sorted:
        players_per_country.append(player)

    players_top_ten_per_country = []

    for player in players_per_country:
        if not any(player_dict['ID'] == player['ID'] for player_dict in players_top_ten_per_country):
            players_top_ten_per_country.append({
                'ID': player['ID'],
                'Name': player['Name'],
                'Photo': player['Photo'],
                'Nationality': player['Nationality'],
                'Flag': player['Flag'],
                'Overall': player['Overall'],
                'Value': player['Value']
            })

    return jsonify(players_top_ten_per_country)


@app.route('/init_db')
def init_db():
    fifa_data.drop()
    csvfile = 'resources/FIFA_data.csv'
    csv_read = pd.read_csv(csvfile)
    fifa_data.insert_many(csv_read.to_dict('records'))
    return redirect('../', code=302)

if __name__ == "__main__":
    app.run(debug=True)
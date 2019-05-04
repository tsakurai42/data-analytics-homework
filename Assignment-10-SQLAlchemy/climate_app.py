from flask import Flask, jsonify

import pandas as pd
import datetime as dt
from datetime import datetime
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from dateutil.relativedelta import relativedelta
#flask setup

engine = create_engine("sqlite:///Resources/hawaii.sqlite",connect_args={'check_same_thread': False})

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

Measurement = Base.classes.measurement
Station = Base.classes.station
session = Session(engine)

lastdate = session.query(Measurement).order_by(Measurement.date.desc()).first().date
one_year_ago_date = (datetime.strptime(lastdate,'%Y-%m-%d') - relativedelta(years=1)).strftime("%Y-%m-%d")

def calc_temps(start_date, end_date):
    """TMIN, TAVG, and TMAX for a list of dates.
    
    Args:
        start_date (string): A date string in the format %Y-%m-%d
        end_date (string): A date string in the format %Y-%m-%d
        
    Returns:
        TMIN, TAVE, and TMAX
    """
    
    return session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
        filter(Measurement.date >= start_date).filter(Measurement.date <= end_date).all()

app = Flask(__name__)

@app.route("/")
def index():
    #list all possible routes
    print("svr req for index")
    return '<a href="/api/v1.0/precipitation">Precipitation API</a>\
        <br><a href="/api/v1.0/stations">Station API</a>\
        <br><a href="/api/v1.0/tobs">Temp Obs API</a>\
        <br><a href="/api/v1.0/2012-01-01">/api/v1.0/{start_date as %Y-%m-%d}</a>\
        <br><a href="/api/v1.0/2012-01-01/2012-01-02">/api/v1.0/{start_date as %Y-%m-%d}/{end_date as %Y-%m-%d}</a>'
#gave default values to the links so i didn't have to type out /api/v1.0/blah blah to test, easier to edit the URL than to write it new.

@app.route("/api/v1.0/precipitation")
def prcp():
    #convert query to dict using date as key adn prcp as value
    #filtering by last year because otherwise it loads wayyyyyy too much
    #return json
    all_data_df = pd.read_sql(session.query(Measurement.id,Measurement.date,Measurement.prcp)\
        .filter(Measurement.date >= one_year_ago_date)\
        .filter(Measurement.date <= lastdate).statement,engine,index_col='id')
    print("svr req for prcp")
    return(all_data_df.to_json(orient='index'))

@app.route("/api/v1.0/stations")
def stations():
    # list json of stations from dataset
    station_by_total_prcp_df = pd.read_sql(session.query(Measurement.station,Station.name,Station.latitude, Station.longitude,Station.elevation,func.sum(Measurement.prcp))\
        .filter(Measurement.station == Station.station)\
        .group_by(Measurement.station)\
        .order_by(func.sum(Measurement.prcp).desc()).statement,engine,index_col="station")
    print("svr req for stations")
    return(station_by_total_prcp_df.to_json(orient='index'))

@app.route("/api/v1.0/tobs")
def tobs():
    #query for dates adn temp obs for last year
    #return json list of temp obs for previous year

    past_year_tobs_df = pd.read_sql(session.query(Measurement.id,Measurement.date,Measurement.tobs)\
        .filter(Measurement.date <= lastdate)\
        .filter(Measurement.date >= one_year_ago_date).statement,engine,index_col='id')
    print("svr req for tobs")
    return(past_year_tobs_df.to_json(orient='index'))
    
@app.route("/api/v1.0/<start>")
def start_to_last(start):
    #only start given, return json list of min avg max
    print("svr req for start to last")
    now = datetime.now()
    if (start > now.strftime("%Y-%m-%d")):
        return('Your start date cannot be in the future')
    elif (start > lastdate):
        return(f'The last day of data is {lastdate} and your start date must be before this')
    elif start < now.strftime("%Y-%m-%d"):
        (tmin,tavg,tmax) = calc_temps(start,now.strftime("%Y-%m-%d"))[0]
        temp_dict = [{'Start Date':start},{'Temp Min':tmin},{'Temp Avg':tavg},{'Temp Max':tmax}]
        return(jsonify(temp_dict))
    

@app.route("/api/v1.0/<start>/<end>")
def start_to_end(start,end):
    #both dates given, return json list of min avg max
    print("svr req for start to end")
    now = datetime.now()
    if (start > now.strftime("%Y-%m-%d")):
        return('Your start date cannot be in the future')
    elif (start > lastdate):
        return(f'The last day of data is {lastdate} and your start date must be before this')
    elif end >= start:
        (tmin,tavg,tmax) = calc_temps(start,end)[0]
        temp_dict = [{'Start Date':start},{'End Date':end},{'Temp Min':tmin},{'Temp Avg':tavg},{'Temp Max':tmax}]
        return(jsonify(temp_dict))
    else:
        return('Your start date cannot be after your end date')

if __name__ == "__main__":
    app.run(debug=True)
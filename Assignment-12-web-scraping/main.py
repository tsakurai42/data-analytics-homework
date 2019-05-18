import pymongo
from flask import Flask, render_template, redirect
import scrape_mars


app = Flask(__name__)

conn = 'mongodb://localhost:27017'

client = pymongo.MongoClient(conn)

db = client.mars_db

@app.route('/')
def index():
    mars = db.mars_info.find_one()
    #print(mars)
    if mars is None: #on first run, there won't be a database nor results, so initial force redirect to scrape.
        return redirect('/scrape',code=302)
    else:
        return render_template('index.html', marsvar = mars)

@app.route('/scrape')
def scraper():
    db.mars_info.drop()
    mars_dict = scrape_mars.scrape()
    db.mars_info.insert_one(mars_dict)
    return redirect('../', code=302)

if __name__ == "__main__":
    app.run(debug=True)
import pymongo

conn = 'mongodb://localhost:27017'

client = pymongo.MongoClient(conn)

db = client.mars_db


mars = db.mars_info.find_one()
print(mars['title'])
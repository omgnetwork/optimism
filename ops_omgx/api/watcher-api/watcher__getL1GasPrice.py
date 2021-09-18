import json
import yaml
import pymysql
import boto3
import string
import random
import time
import requests
import redis

def watcher__getL1GasPrice(event, context):

  #Read YML
  with open("env.yml", 'r') as ymlfile:
    config = yaml.load(ymlfile)

  #Connect to redis
  redis_endpoint = config.get("REDIS_ENDPOINT")
  redis_port = config.get("REDIS_PORT")
  access_key = config.get('ETH_GAS_STATION_KEY')

  # Connect to Redis Elasticache
  db = redis.StrictRedis(host=redis_endpoint, port=redis_port)

  l1GasPriceCache = db.get("l1GasPrice")

  # No data found
  if l1GasPriceCache == None:
    payload = getL1GasPrice(access_key)
    # payload is good
    if payload:
      db.set("l1GasPrice", json.dumps(payload))
      return returnPayload(200, payload)
    # bad payload
    else: return returnPayload(400, {"error": "Failed to get L1 gas price"})
  else:
    # Found data in cache -- invalid
    l1GasPriceCache = json.loads(l1GasPriceCache)
    if l1GasPriceCache["timestamp"] + 30 * 1000 < int(round(time.time() * 1000)):
      payload = getL1GasPrice(access_key)
      if payload:
        db.set("l1GasPrice", json.dumps(payload))
        return returnPayload(200, payload)
      else:
        return returnPayload(400, {"error": "Failed to get L1 gas price"})
    else:
      # Return cache
      return returnPayload(200, l1GasPriceCache)

def getL1GasPrice(access_key):
  # GET request
  res = requests.get('https://ethgasstation.info/api/ethgasAPI.json?api-key=' + access_key)
  if res.status_code == 200:
    payload = res.json()
    payload["timestamp"] = int(round(time.time() * 1000))
    return payload
  else:
    return None

def returnPayload(status, payload):
  response = {
    "statusCode": status,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": True,
      "Strict-Transport-Security": "max-age=63072000; includeSubdomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "same-origin",
      "Permissions-Policy": "*",
    },
    "body": json.dumps(payload),
  }
  return response

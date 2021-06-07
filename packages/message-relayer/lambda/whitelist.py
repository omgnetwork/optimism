import json

def get_whitelist(event, context):
  whitelist = [
    "0xb1b9F48d1DFF3C08288c73117FC21fAE47c5a8Ec",
    "0x79F81178B1358F209dbFCeC57f42918CC3a36cEC"
  ]
  response = {
    "statusCode": 201,
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
    "body": json.dumps(whitelist),
  }
  return response
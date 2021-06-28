import json

def get_whitelist(event, context):
  whitelist = [
    "0xA306702e58Cd4A2E73E6EdbC668F42a21bAdAF0C",
    "0x1eCD5FBbb64F375A74670A1233CfA74D695fD861",
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

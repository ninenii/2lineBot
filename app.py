from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# LINE Channel Access Token
LINE_ACCESS_TOKEN = "UiQb94tyD1whY/1I2iAaVIUSijxvvNqAVjCnJwEZNiO1LEtYqeQBkdmcNL3qSCHDS7JCsDDM3n94o/t/htF0ygUmuD5bzZtyCqpMLFjuxGHaQ/0n0t83Y5DaPAo64ZHX6WKMs+yg4rE76ypEbfMEfAdB04t89/1O/w1cDnyilFU="

# ThingSpeak API URL
THINGSPEAK_URL = "https://api.thingspeak.com/channels/2743926/fields/1.json?api_key=E963HNR4SUJWS8YO"

def reply_to_line(reply_token, message):
    url = "https://api.line.me/v2/bot/message/reply"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}"
    }
    data = {
        "replyToken": reply_token,
        "messages": [{"type": "text", "text": message}]
    }
    requests.post(url, headers=headers, json=data)

@app.route("/webhook", methods=["POST"])
def webhook():
    body = request.json
    if body["events"][0]["type"] == "message":
        reply_token = body["events"][0]["replyToken"]
        user_message = body["events"][0]["message"]["text"]
        
        if user_message.lower() == "ph now":
            response = requests.get(THINGSPEAK_URL)
            data = response.json()
            ph_value = data.get("field1", "No data")
            reply_to_line(reply_token, f"Current pH: {ph_value}")
        else:
            reply_to_line(reply_token, "Send 'PH now' to get the pH value.")
    
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
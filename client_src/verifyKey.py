import requests 


def verifyKey(data):
    print(data[6:26])
    apikey = data[6:26]
    print("ApiKey = ",apikey)
    url = "AWS Endpoint"
    headers = {"X-API-Key":"AWS Header"}
    data = '{"key":"'+str(apikey)+'"}'

    res = requests.post(url = url, headers = headers, data = data )

    if (res.status_code == 200):
        print("Key Verified.")
    elif (res.status_code == 400):
        print("Invalid API key. Please try again.")
    elif (res.status_code == 409):
        print("API key already taken. Please try again with an unused API key.")
    else:
        print("Something went wrong with the server.")



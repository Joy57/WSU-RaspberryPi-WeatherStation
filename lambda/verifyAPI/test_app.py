from unittest import TestCase, mock
import app
import json
class TestSimple(TestCase):

    #test with invalid API Key
    @mock.patch('app.pymysql', autospec=True)
    def test_post_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 2
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = {'resource': '/verifyKey', 'path': '/verifyKey', 'httpMethod': 'POST', 'headers': {'Accept': '*/*', 'Content-Type': 'application/x-www-form-urlencoded', 'Host': 'cxdp3vrdt6.execute-api.us-east-2.amazonaws.com', 'User-Agent': 'curl/7.54.0', 'X-Amzn-Trace-Id': 'Root=1-5bfaf522-39b47706d6ee972ededf9c40', 'x-api-key': '7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx', 'X-Forwarded-For': '69.14.78.142', 'X-Forwarded-Port': '443', 'X-Forwarded-Proto': 'https'}, 'multiValueHeaders': {'Accept': ['*/*'], 'Content-Type': ['application/x-www-form-urlencoded'], 'Host': ['cxdp3vrdt6.execute-api.us-east-2.amazonaws.com'], 'User-Agent': ['curl/7.54.0'], 'X-Amzn-Trace-Id': ['Root=1-5bfaf522-39b47706d6ee972ededf9c40'], 'x-api-key': ['7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx'], 'X-Forwarded-For': ['69.14.78.142'], 'X-Forwarded-Port': ['443'], 'X-Forwarded-Proto': ['https']}, 'queryStringParameters': None, 'multiValueQueryStringParameters': None, 'pathParameters': None, 'stageVariables': None, 'requestContext': {'resourceId': 'urwqzx', 'resourcePath': '/verifyKey', 'httpMethod': 'POST', 'extendedRequestId': 'Q7s9dHs5iYcFUDQ=', 'requestTime': '25/Nov/2018:19:16:50 +0000', 'path': '/dev/verifyKey', 'accountId': '804994069721', 'protocol': 'HTTP/1.1', 'stage': 'dev', 'domainPrefix': 'cxdp3vrdt6', 'requestTimeEpoch': 1543173410995, 'requestId': 'a9656a19-f0e6-11e8-ab2e-b75394e49a86', 'identity': {'cognitoIdentityPoolId': None, 'cognitoIdentityId': None, 'apiKey': '7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx', 'cognitoAuthenticationType': None, 'userArn': None, 'apiKeyId': 'o2axzlqtla', 'userAgent': 'curl/7.54.0', 'accountId': None, 'caller': None, 'sourceIp': '69.14.78.142', 'accessKey': None, 'cognitoAuthenticationProvider': None, 'user': None}, 'domainName': 'cxdp3vrdt6.execute-api.us-east-2.amazonaws.com', 'apiId': 'cxdp3vrdt6'}, 'body': '{"key":"gibrish12345678"}', 'isBase64Encoded': False}
        expected_data = {"headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},"statusCode": 400,"body": json.dumps("Invalid API")}
        self.assertEqual(expected_data, app.handler(data, ""))


    #test with valid API Key
    @mock.patch('app.pymysql', autospec=True)
    def test_post2_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = {'resource': '/verifyKey', 'path': '/verifyKey', 'httpMethod': 'POST', 'headers': {'Accept': '*/*', 'Content-Type': 'application/x-www-form-urlencoded', 'Host': 'cxdp3vrdt6.execute-api.us-east-2.amazonaws.com', 'User-Agent': 'curl/7.54.0', 'X-Amzn-Trace-Id': 'Root=1-5bfaf522-39b47706d6ee972ededf9c40', 'x-api-key': '7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx', 'X-Forwarded-For': '69.14.78.142', 'X-Forwarded-Port': '443', 'X-Forwarded-Proto': 'https'}, 'multiValueHeaders': {'Accept': ['*/*'], 'Content-Type': ['application/x-www-form-urlencoded'], 'Host': ['cxdp3vrdt6.execute-api.us-east-2.amazonaws.com'], 'User-Agent': ['curl/7.54.0'], 'X-Amzn-Trace-Id': ['Root=1-5bfaf522-39b47706d6ee972ededf9c40'], 'x-api-key': ['7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx'], 'X-Forwarded-For': ['69.14.78.142'], 'X-Forwarded-Port': ['443'], 'X-Forwarded-Proto': ['https']}, 'queryStringParameters': None, 'multiValueQueryStringParameters': None, 'pathParameters': None, 'stageVariables': None, 'requestContext': {'resourceId': 'urwqzx', 'resourcePath': '/verifyKey', 'httpMethod': 'POST', 'extendedRequestId': 'Q7s9dHs5iYcFUDQ=', 'requestTime': '25/Nov/2018:19:16:50 +0000', 'path': '/dev/verifyKey', 'accountId': '804994069721', 'protocol': 'HTTP/1.1', 'stage': 'dev', 'domainPrefix': 'cxdp3vrdt6', 'requestTimeEpoch': 1543173410995, 'requestId': 'a9656a19-f0e6-11e8-ab2e-b75394e49a86', 'identity': {'cognitoIdentityPoolId': None, 'cognitoIdentityId': None, 'apiKey': '7NYpat2DyO6yqh6EqXSah924XRzVeBi26TEPcwfx', 'cognitoAuthenticationType': None, 'userArn': None, 'apiKeyId': 'o2axzlqtla', 'userAgent': 'curl/7.54.0', 'accountId': None, 'caller': None, 'sourceIp': '69.14.78.142', 'accessKey': None, 'cognitoAuthenticationProvider': None, 'user': None}, 'domainName': 'cxdp3vrdt6.execute-api.us-east-2.amazonaws.com', 'apiId': 'cxdp3vrdt6'}, 'body': '{"key":"ffb97bc80462cbeca180"}', 'isBase64Encoded': False}
        expected_data = {"headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},"statusCode": 200,"body": json.dumps("API Verified!")}
        self.assertEqual(expected_data, app.handler(data, ""))

  
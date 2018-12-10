from unittest import TestCase, mock
import lambda_function

class TestSimple(TestCase):

    #test with valid parameters
    @mock.patch('lambda_function.pymysql', autospec=True)
    def test_post_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = "2018,ffb97bc80462cbeca180, 1100.68, 36.51, 1003.82, n/a, n/a, 50.0, , 78.3"
        self.assertEqual(test_data, lambda_function.do_work(data))

    #off by one parameter
    @mock.patch('lambda_function.pymysql', autospec=True)
    def test_post2_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = "2018,ffb97bc80462cbeca180, 1100.68, 36.51, 1003.82, n/a, n/a, 50.0, "
        self.assertNotEqual(test_data, lambda_function.do_work(data))

    #test with empty string parameters
    @mock.patch('lambda_function.pymysql', autospec=True)
    def test_post3_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = ""
        self.assertNotEqual(test_data, lambda_function.do_work(data))

    #test with WEATHER API Key shorter than 2
    @mock.patch('lambda_function.pymysql', autospec=True)
    def test_post4_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = "2018,f, 1100.68, 36.51, 1003.82, n/a, n/a, 50.0, , 78.3"
        self.assertNotEqual(test_data, lambda_function.do_work(data))
    
    

    #test with WEATHER API Key equal to 2 
    @mock.patch('lambda_function.pymysql', autospec=True)
    def test_post5_data(self, mock_pymysql):
        mock_cursor = mock.MagicMock()
        test_data = 1
        mock_cursor.fetchall.return_value = test_data
        mock_pymysql.connect.return_value.cursor.return_value.__enter__.return_value = mock_cursor
        data = "2018,f3, 1100.68, 36.51, 1003.82, n/a, n/a, 50.0, , 78.3"
        self.assertEqual(test_data, lambda_function.do_work(data))
    
    
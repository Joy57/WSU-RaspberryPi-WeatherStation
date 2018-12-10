import glob, os, time

#Function to search for the first created file inside of the directory. Used to find the first file received. 
def oldest():
        os.chdir("/home/pi/Desktop/dist/data")
        try:
                oldest = min(glob.iglob('*.txt'), key = os.path.getctime)
        except:
                print("Empty")
                time.sleep(10)
                oldest = min(glob.iglob('*.txt'), key = os.path.getctime)
	print(oldest)
	return oldest
	



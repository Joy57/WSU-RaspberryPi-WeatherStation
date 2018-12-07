import os
import sys

def print_usage():
    print("Usage:")
    print("\tinstall boot script: python setup.py -i")
    print("\tremove boot script: python setup.py -r")

def main():
    stationFile = os.path.dirname(os.path.abspath(__file__)) + "/weatherstation"
    args = sys.argv

    # If we have the wrong number of arguments
    if (len(args) != 2):
        print_usage()
    else:
        # If the first argument is "-r"
        if (args[1] == "-r"):
            # Removes the crontab that matches our script
            os.system("crontab -l | " + "grep -v '@reboot exec {0} > /dev/null 2> /dev/null &'".format(stationFile) + " | crontab -")
            print('Removed weather station bootup script')
        # If the first argument is "-i"
        elif (args[1] == "-i"):
            # Checks if we find the string "exec /path/to/weatherstation" in our crontabs
            if os.system("crontab -l 2> /dev/null | grep -q 'exec {0}'".format(stationFile)): 
                # Prints our existing crontabs to null (so they don't show up in terminal)
                os.system("(crontab -l 2> /dev/null;" 
                    # Prints new crontab at end of old crontabs and outputs all printed stuff to the crontab file
                    + "echo '@reboot exec {0} > /dev/null 2> /dev/null &')".format(stationFile) + "| crontab -;"
                    + "echo 'The weather station client will now run on boot'")
            else:
                print('Already set up to run on boot')
        else:
            print_usage()

if __name__ == "__main__":
    main()
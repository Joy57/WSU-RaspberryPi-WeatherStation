import json
import boto3

rds = boto3.client('rds')

def create_db():
    response = rds.create_db_instance(
    DBName='weatherstation',
    DBInstanceIdentifier='wsu-weather-station',
    AllocatedStorage=20,
    DBInstanceClass='db.t2.small',
    Engine='MySQL',
    MasterUsername='wsu',
    MasterUserPassword='wsucapstone2018',
    AvailabilityZone='us-east-1a',
    BackupRetentionPeriod=0,
    Port=3306,
    MultiAZ=False,
    EngineVersion='5.7',
    AutoMinorVersionUpgrade=True,
    LicenseModel='general-public-license',
    PubliclyAccessible=True,
    Tags=[
        {
            'Key': 'Name',
            'Value': 'lambda_db_instanceVal'
        },
    ],
    StorageType='gp2',
    StorageEncrypted=True,
    KmsKeyId='c6ff082e-e8ff-44a1-a84e-47a174aec204',
    CopyTagsToSnapshot=True|False,
    EnableIAMDatabaseAuthentication=False,
    EnablePerformanceInsights=False
    
)


def lambda_handler(event, context):
    
    create_db()
    return {
        'statusCode': 200,
        'body': json.dumps('Successfully executed RDS Script: please wait at least 3 minutes before continuing to the next step')
    }

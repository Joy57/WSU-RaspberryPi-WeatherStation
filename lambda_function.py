import json
import boto3

rds = boto3.client('rds')

def create_db():
    response = rds.create_db_instance(
    DBName='test1',
    DBInstanceIdentifier='wsu-station-rds',
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
    KmsKeyId='fc080608-51cb-44ce-96cd-0213d3755675',
    CopyTagsToSnapshot=True|False,
    EnableIAMDatabaseAuthentication=False,
    EnablePerformanceInsights=False
    
)


def lambda_handler(event, context):
    
    create_db()
    return {
        'statusCode': 200,
        'body': json.dumps('completed')
    }

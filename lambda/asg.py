import json
import boto3
import time


def create_auto_scaling():
    """Create auto scaling group for load balancer"""

    autoscaling = boto3.client('autoscaling')
    response = autoscaling.create_auto_scaling_group(
    AutoScalingGroupName='lambda-auto-scaling-group-test1',
    AvailabilityZones=[
        'us-east-1a',
        'us-east-1b',
    ],
    HealthCheckGracePeriod=120,
    HealthCheckType='ELB',
    LaunchConfigurationName='lambda-launch-config-test1',
    TargetGroupARNs=[
        'arn:aws:elasticloadbalancing:us-east-1:804994069721:targetgroup/my-targets-test2/cb3c2e82b2a7dc83',
    ],
    MaxSize=2,
    MinSize=2,
)

    print("auto scaling response-->>",response)

def lambda_handler(event, context):
    """this function is the main func for lambda"""
    create_auto_scaling()
    return {
        'statusCode': 200,
        'body': json.dumps('done')
    }

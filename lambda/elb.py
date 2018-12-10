import json
import boto3
import time

elb = boto3.client('elb')
elbv2 = boto3.client('elbv2')
ec2 = boto3.client('ec2')
autoscaling = boto3.client('autoscaling')

def getVpcIds():
    """retreieves vpc id by making api call to ec2"""

    response = ec2.describe_vpcs(
    
)   
    json_resp = json.dumps(response)
    json_load = json.loads(json_resp)
    vpcs = json_load['Vpcs'][0]
    vpc_id = vpcs['VpcId']
    return vpc_id

def getSubnets(id):
    """retrieves subnet ids from the vpc by making call to ec2. Returns a list of subnets"""
    response = ec2.describe_subnets(
    Filters=[
        {
            'Name': 'vpc-id',
            'Values': [
                id,
            ],
        },
    ],
)
    json_resp = json.dumps(response)
    json_load = json.loads(json_resp)
    Subnets = json_load['Subnets']
    print("subnets response---->",Subnets)
    list_sub = []
    for r in Subnets:
        print("Subnets-->", r['SubnetId'])
        list_sub.append(r['SubnetId'])
    # print(list_sub)     
    return list_sub    
    
def create_load_balancer(sub, s_group):
    """creates a internet facing load balancer in two different subnets. Returns an amazon resource name"""
    response = elbv2.create_load_balancer(
        Name='loadbalancer-joy-final',
        Subnets=[
            sub[0],
            sub[1],
        ],
        SecurityGroups=[
            s_group,
        ],
        Scheme='internet-facing',
        Tags=[
            {
                'Key': 'Name',
                'Value': 'NAME_lambda_ELB_test2'
            },
        ],
        Type='application',
        IpAddressType='ipv4'
    )
    print("ELB Response: ",response)
    
    print("elb res json load type-->",type(response))

    load_res = response['LoadBalancers'][0]
    load_arn = load_res['LoadBalancerArn']
    print("BALANCER_ARN -->",load_arn)
    # return target_arn
    return load_arn
    
def create_target(vpc_id):
    """create target group for Auto scaling group. Returns a target amazon resource name"""
    response = elbv2.create_target_group(
    Name='my-targets-test2',
    Port=80,
    Protocol='HTTP',
    VpcId=vpc_id,
)
    print("create_target response-->",response)
    target_res = response['TargetGroups'][0]
    target_arn = target_res['TargetGroupArn']
    print("BALANCER_ARN -->",target_arn)
    return target_arn

def create_listener(target_arn, balancer_arn):
    """create a http listener for load balancer."""
    response = elbv2.create_listener(
    DefaultActions=[
        {
            'TargetGroupArn': target_arn,
            'Type': 'forward',
        },
    ],
    LoadBalancerArn= balancer_arn,
    Port=80,
    Protocol='HTTP',
)
    print("create_listener response-->",response)

def create_launch_config(security_group_ID, key_Name):
    """create launch configuration to launch from incase one server crashes"""
    response = autoscaling.create_launch_configuration(
    ImageId='ami-057528decc675aa64',
    KeyName= key_Name,
    InstanceType='t2.micro',
    LaunchConfigurationName='lambda-launch-config-test1',
    SecurityGroups=[
        security_group_ID,
    ],
)

    print(response)


def lambda_handler(event, context): 
    """this function is the main method in lambda"""
    id = getVpcIds()
    print("vpc_id--->", id)
    subnets = getSubnets(id)
    print(subnets)
    security_group_ID = "sg-0d27a7b25e7db84ab" 
    keyName = 'US-KeyPair'
    balancer_arn = create_load_balancer(subnets, security_group_ID)
    
    target_arn = create_target(id)
    create_listener(target_arn, balancer_arn)
    create_launch_config(security_group_ID, keyName)
    
    return {
        'statusCode': 200,
        'body': json.dumps('done')
    }

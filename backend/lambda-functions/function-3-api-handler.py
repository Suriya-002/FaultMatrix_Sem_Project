"""
Lambda Function: API Handler
Purpose: Handle REST API requests from frontend
"""

import boto3
import json
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

GUIDES_TABLE = os.environ.get('DYNAMODB_GUIDES_TABLE', 'faultmatrix-repair-guides-dev')
DEVICES_TABLE = os.environ.get('DYNAMODB_DEVICES_TABLE', 'faultmatrix-devices-dev')
PATTERNS_TABLE = os.environ.get('DYNAMODB_PATTERNS_TABLE', 'faultmatrix-failure-patterns-dev')
ROOT_CAUSES_TABLE = os.environ.get('DYNAMODB_ROOT_CAUSES_TABLE', 'faultmatrix-root-causes-dev')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_all_devices():
    """Get all devices"""
    table = dynamodb.Table(DEVICES_TABLE)
    response = table.scan()
    return response.get('Items', [])

def get_device_details(device_id):
    """Get device details with patterns and root causes"""
    devices_table = dynamodb.Table(DEVICES_TABLE)
    patterns_table = dynamodb.Table(PATTERNS_TABLE)
    root_causes_table = dynamodb.Table(ROOT_CAUSES_TABLE)
    
    device = devices_table.get_item(Key={'device_id': device_id}).get('Item')
    
    patterns_response = patterns_table.query(
        IndexName='device_id-index',
        KeyConditionExpression='device_id = :device_id',
        ExpressionAttributeValues={':device_id': device_id}
    )
    patterns = patterns_response.get('Items', [])
    
    root_causes_response = root_causes_table.query(
        IndexName='device_id-index',
        KeyConditionExpression='device_id = :device_id',
        ExpressionAttributeValues={':device_id': device_id}
    )
    root_causes = root_causes_response.get('Items', [])
    
    return {
        'device': device,
        'patterns': patterns,
        'root_causes': root_causes
    }

def get_statistics():
    """Get dashboard statistics"""
    guides_table = dynamodb.Table(GUIDES_TABLE)
    devices_table = dynamodb.Table(DEVICES_TABLE)
    patterns_table = dynamodb.Table(PATTERNS_TABLE)
    
    guides_count = guides_table.scan(Select='COUNT').get('Count', 0)
    devices_count = devices_table.scan(Select='COUNT').get('Count', 0)
    patterns_count = patterns_table.scan(Select='COUNT').get('Count', 0)
    
    return {
        'total_guides': guides_count,
        'total_devices': devices_count,
        'total_patterns': patterns_count
    }

def lambda_handler(event, context):
    """Main API handler"""
    
    path = event.get('path', '')
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    try:
        if method == 'OPTIONS':
            return {'statusCode': 200, 'headers': headers, 'body': ''}
        
        if path == '/devices' and method == 'GET':
            devices = get_all_devices()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(devices, cls=DecimalEncoder)
            }
        
        elif path.startswith('/devices/') and method == 'GET':
            device_id = path.split('/')[-1]
            details = get_device_details(device_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(details, cls=DecimalEncoder)
            }
        
        elif path == '/stats' and method == 'GET':
            stats = get_statistics()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(stats, cls=DecimalEncoder)
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

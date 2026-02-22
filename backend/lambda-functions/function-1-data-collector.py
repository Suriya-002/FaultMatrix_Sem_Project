"""
Lambda Function: iFixit Data Collector
Purpose: Fetch repair guides from iFixit API and store in DynamoDB
"""

import boto3
import json
import os
import requests
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
GUIDES_TABLE = os.environ.get('DYNAMODB_GUIDES_TABLE', 'faultmatrix-repair-guides-dev')
DEVICES_TABLE = os.environ.get('DYNAMODB_DEVICES_TABLE', 'faultmatrix-devices-dev')
IFIXIT_API_BASE = "https://www.ifixit.com/api/2.0"

def fetch_repair_guides(limit=100):
    """Fetch repair guides from iFixit API"""
    guides = []
    offset = 0
    
    while len(guides) < limit:
        url = f"{IFIXIT_API_BASE}/guides?limit=100&offset={offset}"
        response = requests.get(url, timeout=30)
        
        if response.status_code != 200:
            break
            
        data = response.json()
        batch_guides = data.get('guides', [])
        
        if not batch_guides:
            break
            
        guides.extend(batch_guides)
        offset += 100
        
        if len(batch_guides) < 100:
            break
    
    return guides[:limit]

def store_guide(guide):
    """Store guide in DynamoDB"""
    table = dynamodb.Table(GUIDES_TABLE)
    
    item = {
        'guide_id': str(guide.get('guideid')),
        'created_at': datetime.utcnow().isoformat(),
        'device': guide.get('device', 'Unknown'),
        'device_id': guide.get('device', 'unknown').lower().replace(' ', '_'),
        'title': guide.get('title', ''),
        'subject': guide.get('subject', ''),
        'type': guide.get('type', ''),
        'difficulty': guide.get('difficulty', ''),
        'steps': guide.get('steps', []),
        'tools': guide.get('tools', []),
        'parts': guide.get('parts', []),
        'url': guide.get('url', ''),
        'raw_data': json.dumps(guide)
    }
    
    table.put_item(Item=item)
    return item

def store_device(device_name):
    """Store device in devices table"""
    table = dynamodb.Table(DEVICES_TABLE)
    device_id = device_name.lower().replace(' ', '_')
    
    try:
        table.put_item(
            Item={
                'device_id': device_id,
                'device_name': device_name,
                'created_at': datetime.utcnow().isoformat()
            },
            ConditionExpression='attribute_not_exists(device_id)'
        )
    except:
        pass

def lambda_handler(event, context):
    """Main handler"""
    print("=" * 80)
    print("iFixit Data Collector Started")
    print("=" * 80)
    
    limit = event.get('limit', 100)
    
    try:
        guides = fetch_repair_guides(limit)
        print(f"Fetched {len(guides)} guides")
        
        stored_count = 0
        devices_found = set()
        
        for guide in guides:
            try:
                store_guide(guide)
                stored_count += 1
                
                device = guide.get('device')
                if device and device not in devices_found:
                    store_device(device)
                    devices_found.add(device)
                
                if stored_count % 10 == 0:
                    print(f"Stored {stored_count}/{len(guides)} guides...")
                    
            except Exception as e:
                print(f"Error storing guide {guide.get('guideid')}: {str(e)}")
        
        print(f"COMPLETE: Stored {stored_count} guides, {len(devices_found)} devices")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'guides_stored': stored_count,
                'devices_found': len(devices_found),
                'guides_fetched': len(guides)
            })
        }
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

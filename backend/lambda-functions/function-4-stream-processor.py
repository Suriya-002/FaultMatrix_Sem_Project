"""
Lambda Function: DynamoDB Streams Processor
Purpose: Process stream events for real-time aggregation
"""

import boto3
import json
from collections import Counter

dynamodb = boto3.resource('dynamodb')

def process_stream_record(record):
    """Process a single DynamoDB stream record"""
    event_name = record['eventName']
    
    if event_name in ['INSERT', 'MODIFY']:
        new_image = record['dynamodb'].get('NewImage', {})
        
        return {
            'event': event_name,
            'device_id': new_image.get('device_id', {}).get('S', 'unknown'),
            'component': new_image.get('component', {}).get('S', 'unknown'),
            'pattern_id': new_image.get('pattern_id', {}).get('S', 'unknown')
        }
    
    return None

def update_aggregates(events):
    """Update aggregate statistics"""
    component_counts = Counter()
    device_counts = Counter()
    
    for event in events:
        if event:
            component_counts[event['component']] += 1
            device_counts[event['device_id']] += 1
    
    return {
        'components': dict(component_counts.most_common(10)),
        'devices': dict(device_counts.most_common(10))
    }

def lambda_handler(event, context):
    """Process DynamoDB stream events"""
    print(f"Processing {len(event['Records'])} stream records...")
    
    try:
        processed_events = []
        for record in event['Records']:
            processed = process_stream_record(record)
            if processed:
                processed_events.append(processed)
        
        if processed_events:
            aggregates = update_aggregates(processed_events)
            print(f"Top components: {aggregates['components']}")
            print(f"Top devices: {aggregates['devices']}")
        
        print(f"Successfully processed {len(processed_events)} events")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'processed': len(processed_events),
                'total_records': len(event['Records'])
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

"""
Lambda Function: NLP Processor
Purpose: Extract entities and identify failure patterns
"""

import boto3
import json
import os
from datetime import datetime
from collections import Counter

dynamodb = boto3.resource('dynamodb')
GUIDES_TABLE = os.environ.get('DYNAMODB_GUIDES_TABLE', 'faultmatrix-repair-guides-dev')
PATTERNS_TABLE = os.environ.get('DYNAMODB_PATTERNS_TABLE', 'faultmatrix-failure-patterns-dev')

def extract_entities_simple(text):
    """Simple rule-based entity extraction"""
    components = [
        'battery', 'screen', 'display', 'motherboard', 'logic board',
        'camera', 'speaker', 'microphone', 'button', 'port', 'jack',
        'hinge', 'keyboard', 'trackpad', 'hard drive', 'ssd', 'ram',
        'fan', 'power supply', 'cable', 'connector', 'lens', 'sensor',
        'charging port', 'home button', 'volume button', 'power button'
    ]
    
    tools = [
        'screwdriver', 'spudger', 'tweezers', 'heat gun', 'suction cup',
        'pry tool', 'opening tool', 'plastic card', 'jimmy'
    ]
    
    text_lower = text.lower()
    
    found_components = [c for c in components if c in text_lower]
    found_tools = [t for t in tools if t in text_lower]
    
    return {
        'components': list(set(found_components)),
        'tools': list(set(found_tools))
    }

def analyze_failure_patterns(guide):
    """Extract failure patterns from guide"""
    device_id = guide.get('device_id', 'unknown')
    
    steps = guide.get('steps', [])
    all_text = ' '.join([step.get('title', '') for step in steps])
    
    entities = extract_entities_simple(all_text)
    
    patterns = []
    for component in entities['components']:
        patterns.append({
            'device_id': device_id,
            'component': component,
            'failure_type': 'general',
            'frequency': 1,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    return patterns, entities

def store_patterns(patterns):
    """Store failure patterns in DynamoDB"""
    table = dynamodb.Table(PATTERNS_TABLE)
    
    for pattern in patterns:
        pattern_id = f"{pattern['device_id']}_{pattern['component']}_{pattern['timestamp']}"
        pattern['pattern_id'] = pattern_id
        table.put_item(Item=pattern)

def lambda_handler(event, context):
    """Process guides and extract patterns"""
    print("=" * 80)
    print("NLP Processor Started")
    print("=" * 80)
    
    batch_size = event.get('batch_size', 50)
    
    try:
        guides_table = dynamodb.Table(GUIDES_TABLE)
        response = guides_table.scan(Limit=batch_size)
        guides = response.get('Items', [])
        
        print(f"Processing {len(guides)} guides...")
        
        processed = 0
        total_patterns = 0
        
        for guide in guides:
            try:
                patterns, entities = analyze_failure_patterns(guide)
                
                if patterns:
                    store_patterns(patterns)
                    total_patterns += len(patterns)
                
                guides_table.update_item(
                    Key={'guide_id': guide['guide_id']},
                    UpdateExpression='SET entities = :entities',
                    ExpressionAttributeValues={':entities': entities}
                )
                
                processed += 1
                
                if processed % 10 == 0:
                    print(f"Processed {processed}/{len(guides)} guides...")
                    
            except Exception as e:
                print(f"Error processing guide {guide.get('guide_id')}: {str(e)}")
        
        print(f"COMPLETE: Processed {processed} guides, {total_patterns} patterns")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'guides_processed': processed,
                'patterns_found': total_patterns
            })
        }
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

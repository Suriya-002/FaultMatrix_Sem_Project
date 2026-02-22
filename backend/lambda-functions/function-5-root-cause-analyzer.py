"""
Lambda Function: Root Cause Analyzer
Purpose: Analyze failure patterns using AWS Bedrock Claude
"""

import boto3
import json
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

GUIDES_TABLE = os.environ.get('DYNAMODB_GUIDES_TABLE', 'faultmatrix-repair-guides-dev')
ROOT_CAUSES_TABLE = os.environ.get('DYNAMODB_ROOT_CAUSES_TABLE', 'faultmatrix-root-causes-dev')

def analyze_root_cause(guide):
    """Use Claude to analyze root cause of failure"""
    
    device = guide.get('device', 'Unknown')
    title = guide.get('title', '')
    steps = guide.get('steps', [])
    
    step_summary = ' '.join([step.get('title', '') for step in steps[:5]])
    
    component = 'unknown'
    for step in steps:
        step_text = step.get('title', '').lower()
        if any(c in step_text for c in ['battery', 'screen', 'display', 'camera', 'port']):
            for comp in ['battery', 'screen', 'display', 'camera', 'charging port']:
                if comp in step_text:
                    component = comp
                    break
    
    prompt = f"""You are an expert electronics engineer analyzing device failures.

Repair Guide Information:
- Device: {device}
- Component: {component}
- Title: {title}
- Repair Steps Summary: {step_summary}

Analyze and determine:
1. Root cause (WHY does this component fail?)
2. Evidence from the repair guide
3. Frequency (Common/Occasional/Rare)
4. Fix difficulty (Easy/Moderate/Hard/Professional)
5. Prevention tip

Respond in JSON format:
{{
  "root_cause": "explanation of why failure occurs",
  "evidence": "quote or reference from guide",
  "frequency": "Common|Occasional|Rare",
  "fixability": "Easy|Moderate|Hard|Professional",
  "prevention": "tip to prevent this failure"
}}"""
    
    try:
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 800,
                'messages': [{
                    'role': 'user',
                    'content': prompt
                }]
            })
        )
        
        result = json.loads(response['body'].read())
        content = result['content'][0]['text']
        
        analysis = json.loads(content.replace('```json', '').replace('```', '').strip())
        
        return {
            'device': device,
            'component': component,
            'root_cause': analysis.get('root_cause', 'Unknown'),
            'evidence': analysis.get('evidence', ''),
            'frequency': analysis.get('frequency', 'Unknown'),
            'fixability': analysis.get('fixability', 'Moderate'),
            'prevention': analysis.get('prevention', '')
        }
        
    except Exception as e:
        print(f"Error analyzing root cause: {str(e)}")
        return None

def store_root_cause(guide_id, analysis):
    """Store root cause analysis in DynamoDB"""
    table = dynamodb.Table(ROOT_CAUSES_TABLE)
    
    item = {
        'guide_id': guide_id,
        'timestamp': datetime.utcnow().isoformat(),
        **analysis
    }
    
    table.put_item(Item=item)

def lambda_handler(event, context):
    """Batch process guides for root cause analysis"""
    print("=" * 80)
    print("Root Cause Analyzer Started")
    print("=" * 80)
    
    batch_size = event.get('batch_size', 20)
    
    try:
        guides_table = dynamodb.Table(GUIDES_TABLE)
        response = guides_table.scan(Limit=batch_size)
        guides = response.get('Items', [])
        
        print(f"Analyzing {len(guides)} guides...")
        
        analyzed = 0
        
        for guide in guides:
            try:
                analysis = analyze_root_cause(guide)
                
                if analysis:
                    store_root_cause(guide['guide_id'], analysis)
                    analyzed += 1
                    
                if analyzed % 5 == 0:
                    print(f"Analyzed {analyzed}/{len(guides)} guides...")
                    
            except Exception as e:
                print(f"Error analyzing guide {guide.get('guide_id')}: {str(e)}")
        
        print(f"COMPLETE: Analyzed {analyzed} guides")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'guides_analyzed': analyzed,
                'guides_total': len(guides)
            })
        }
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

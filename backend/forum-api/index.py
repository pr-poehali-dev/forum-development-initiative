'''
Business: Forum API - get topics, posts, create posts with attachments, admin actions
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with forum data
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'topics')
            
            if action == 'topics':
                cur.execute('''
                    SELECT 
                        t.*,
                        u.username as author_name,
                        u.avatar_url as author_avatar,
                        u.reputation as author_reputation,
                        c.name as category_name,
                        c.icon as category_icon
                    FROM topics t
                    JOIN users u ON t.author_id = u.id
                    JOIN categories c ON t.category_id = c.id
                    ORDER BY t.is_pinned DESC, t.updated_at DESC
                ''')
                topics = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'topics': topics}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'categories':
                cur.execute('SELECT * FROM categories ORDER BY display_order')
                categories = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'categories': categories}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'top_users':
                cur.execute('''
                    SELECT id, username, avatar_url, reputation, post_count
                    FROM users
                    ORDER BY reputation DESC
                    LIMIT 10
                ''')
                users = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'users': users}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'topic':
                topic_id = event.get('queryStringParameters', {}).get('id')
                if not topic_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Topic ID required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    SELECT 
                        t.*,
                        u.username as author_name,
                        u.avatar_url as author_avatar,
                        u.reputation as author_reputation,
                        c.name as category_name
                    FROM topics t
                    JOIN users u ON t.author_id = u.id
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.id = %s
                ''', (topic_id,))
                topic = cur.fetchone()
                
                if not topic:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Topic not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    UPDATE topics SET views = views + 1 WHERE id = %s
                ''', (topic_id,))
                conn.commit()
                
                cur.execute('''
                    SELECT 
                        p.*,
                        u.username as author_name,
                        u.avatar_url as author_avatar,
                        u.reputation as author_reputation,
                        u.is_admin,
                        u.is_moderator
                    FROM posts p
                    JOIN users u ON p.author_id = u.id
                    WHERE p.topic_id = %s
                    ORDER BY p.created_at ASC
                ''', (topic_id,))
                posts = cur.fetchall()
                
                for post in posts:
                    cur.execute('''
                        SELECT * FROM attachments WHERE post_id = %s
                    ''', (post['id'],))
                    post['attachments'] = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'topic': topic, 'posts': posts}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_topic':
                title = body_data.get('title')
                category_id = body_data.get('category_id')
                author_id = body_data.get('author_id', 1)
                content = body_data.get('content')
                
                cur.execute('''
                    INSERT INTO topics (title, category_id, author_id)
                    VALUES (%s, %s, %s) RETURNING id
                ''', (title, category_id, author_id))
                topic_id = cur.fetchone()['id']
                
                cur.execute('''
                    INSERT INTO posts (topic_id, author_id, content)
                    VALUES (%s, %s, %s) RETURNING id
                ''', (topic_id, author_id, content))
                
                cur.execute('''
                    UPDATE users SET post_count = post_count + 1 WHERE id = %s
                ''', (author_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'topic_id': topic_id, 'message': 'Topic created'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_post':
                topic_id = body_data.get('topic_id')
                author_id = body_data.get('author_id', 1)
                content = body_data.get('content')
                
                cur.execute('''
                    INSERT INTO posts (topic_id, author_id, content)
                    VALUES (%s, %s, %s) RETURNING id
                ''', (topic_id, author_id, content))
                post_id = cur.fetchone()['id']
                
                cur.execute('''
                    UPDATE topics SET reply_count = reply_count + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (topic_id,))
                
                cur.execute('''
                    UPDATE users SET post_count = post_count + 1 WHERE id = %s
                ''', (author_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'post_id': post_id, 'message': 'Post created'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'toggle_pin':
                topic_id = body_data.get('topic_id')
                cur.execute('''
                    UPDATE topics SET is_pinned = NOT is_pinned WHERE id = %s
                ''', (topic_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Topic pin toggled'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'toggle_lock':
                topic_id = body_data.get('topic_id')
                cur.execute('''
                    UPDATE topics SET is_locked = NOT is_locked WHERE id = %s
                ''', (topic_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Topic lock toggled'}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

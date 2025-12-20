import os
import json
import pickle
import base64
from typing import Optional, Any
from datetime import timedelta
import redis
import requests


class RedisClient:
    """Redis client for session management with Upstash REST API or standard Redis fallback."""
    
    _instance: Optional['RedisClient'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self._initialized = True
        self._redis: Optional[redis.Redis] = None
        self._fallback_store: dict = {}  # In-memory fallback
        self._use_upstash = False
        
        # Check for Upstash REST API first (no VPC needed!)
        self._upstash_url = os.getenv('UPSTASH_REDIS_REST_URL')
        self._upstash_token = os.getenv('UPSTASH_REDIS_REST_TOKEN')
        
        if self._upstash_url and self._upstash_token:
            # Test Upstash connection
            try:
                response = requests.get(
                    f"{self._upstash_url}/ping",
                    headers={"Authorization": f"Bearer {self._upstash_token}"},
                    timeout=5
                )
                if response.status_code == 200:
                    self._use_upstash = True
                    print(f"✅ Connected to Upstash Redis (REST API)")
                    return
            except Exception as e:
                print(f"⚠️ Upstash connection failed: {e}")
        
        # Fall back to standard Redis (Memorystore)
        redis_host = os.getenv('REDIS_HOST', 'localhost')
        redis_port = int(os.getenv('REDIS_PORT', '6379'))
        redis_password = os.getenv('REDIS_PASSWORD', None)
        
        if redis_host and redis_host != 'localhost':
            try:
                self._redis = redis.Redis(
                    host=redis_host,
                    port=redis_port,
                    password=redis_password,
                    decode_responses=False,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                self._redis.ping()
                print(f"✅ Connected to Redis at {redis_host}:{redis_port}")
            except redis.ConnectionError as e:
                print(f"⚠️ Redis connection failed ({redis_host}:{redis_port}): {e}")
                print("   Falling back to in-memory storage")
                self._redis = None
        else:
            print("ℹ️ No Redis configured, using in-memory storage")
    
    def _upstash_request(self, command: list) -> Optional[Any]:
        """Execute a command via Upstash REST API."""
        try:
            response = requests.post(
                self._upstash_url,
                headers={"Authorization": f"Bearer {self._upstash_token}"},
                json=command,
                timeout=10
            )
            if response.status_code == 200:
                return response.json().get('result')
            return None
        except Exception as e:
            print(f"Upstash request error: {e}")
            return None
    
    @property
    def is_connected(self) -> bool:
        """Check if Redis is available."""
        if self._use_upstash:
            return True
        if self._redis is None:
            return False
        try:
            self._redis.ping()
            return True
        except redis.ConnectionError:
            return False
    
    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        """Store a value with TTL (default 1 hour)."""
        try:
            serialized = pickle.dumps(value)
            encoded = base64.b64encode(serialized).decode('utf-8')
            
            if self._use_upstash:
                result = self._upstash_request(["SETEX", key, ttl_seconds, encoded])
                return result == "OK"
            elif self._redis and self.is_connected:
                self._redis.setex(key, ttl_seconds, serialized)
                return True
            else:
                # Fallback: store with expiry time
                import time
                self._fallback_store[key] = {
                    'value': serialized,
                    'expires_at': time.time() + ttl_seconds
                }
                return True
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Retrieve a value by key."""
        try:
            if self._use_upstash:
                encoded = self._upstash_request(["GET", key])
                if encoded:
                    serialized = base64.b64decode(encoded)
                    return pickle.loads(serialized)
                return None
            elif self._redis and self.is_connected:
                data = self._redis.get(key)
                if data:
                    return pickle.loads(data)
            else:
                # Fallback: check expiry
                import time
                stored = self._fallback_store.get(key)
                if stored:
                    if time.time() < stored['expires_at']:
                        return pickle.loads(stored['value'])
                    else:
                        del self._fallback_store[key]
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete a key."""
        try:
            if self._redis and self.is_connected:
                self._redis.delete(key)
            else:
                self._fallback_store.pop(key, None)
            return True
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if a key exists."""
        try:
            if self._redis and self.is_connected:
                return bool(self._redis.exists(key))
            else:
                import time
                stored = self._fallback_store.get(key)
                if stored and time.time() < stored['expires_at']:
                    return True
                return False
        except Exception as e:
            print(f"Redis exists error: {e}")
            return False
    
    def set_json(self, key: str, value: dict, ttl_seconds: int = 3600) -> bool:
        """Store a JSON-serializable dict."""
        try:
            json_str = json.dumps(value)
            
            if self._redis and self.is_connected:
                self._redis.setex(key, ttl_seconds, json_str.encode('utf-8'))
            else:
                import time
                self._fallback_store[key] = {
                    'value': json_str.encode('utf-8'),
                    'expires_at': time.time() + ttl_seconds
                }
            return True
        except Exception as e:
            print(f"Redis set_json error: {e}")
            return False
    
    def get_json(self, key: str) -> Optional[dict]:
        """Retrieve a JSON dict."""
        try:
            if self._redis and self.is_connected:
                data = self._redis.get(key)
                if data:
                    return json.loads(data.decode('utf-8'))
            else:
                import time
                stored = self._fallback_store.get(key)
                if stored:
                    if time.time() < stored['expires_at']:
                        return json.loads(stored['value'].decode('utf-8'))
                    else:
                        del self._fallback_store[key]
            return None
        except Exception as e:
            print(f"Redis get_json error: {e}")
            return None
    
    def cleanup_expired(self):
        """Clean up expired entries in fallback store."""
        if self._redis is None:
            import time
            current_time = time.time()
            expired_keys = [
                k for k, v in self._fallback_store.items()
                if v['expires_at'] < current_time
            ]
            for key in expired_keys:
                del self._fallback_store[key]


# Singleton instance
redis_client = RedisClient()

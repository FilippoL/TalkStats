from google.cloud import firestore
from datetime import datetime, timedelta

class FirestoreClient:
    def __init__(self):
        try:
            print("[INFO] Initializing Firestore client...")
            import os
            project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'whatsappanalyzer-481609')
            print(f"[INFO] GOOGLE_CLOUD_PROJECT: {project_id}")
            
            # Check if we're running with Firestore emulator
            emulator_host = os.getenv('FIRESTORE_EMULATOR_HOST')
            if emulator_host:
                print(f"[INFO] Using Firestore emulator at {emulator_host}")
                import google.auth.credentials
                from google.cloud.firestore import Client
                
                # Create anonymous credentials for emulator
                credentials = google.auth.credentials.AnonymousCredentials()
                self.db = Client(project=project_id, credentials=credentials)
                self.db._client_info = None  # Clear client info for emulator
                self.db._client_options = None
            else:
                self.db = firestore.Client(project=project_id)
            
            print(f"[INFO] Firestore client created for project: {self.db.project}")
            self.sessions_collection = self.db.collection('sessions')
            self.shares_collection = self.db.collection('shares')
            print("[INFO] Firestore client initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Firestore client: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

    def set(self, key: str, data: dict, ttl_seconds: int = None) -> bool:
        """
        Store data in Firestore with optional TTL.
        For large data, stores messages in a subcollection.
        Key format: 'session:<id>' or 'share:<id>'
        """
        try:
            print(f"[INFO] Firestore set: key={key}, ttl={ttl_seconds}")
            if key.startswith('session:'):
                collection = self.sessions_collection
                doc_id = key.replace('session:', '')
            elif key.startswith('share:'):
                collection = self.shares_collection
                doc_id = key.replace('share:', '')
            else:
                raise ValueError(f"Invalid key format: {key}")

            doc_ref = collection.document(doc_id)

            # Handle large messages by storing in subcollection
            messages = data.pop('messages', None)
            if messages:
                print(f"[INFO] Storing {len(messages)} messages in chunks")
                # Store messages in batches to avoid large writes
                batch = self.db.batch()
                batch_count = 0
                subcollection_ref = doc_ref.collection('messages')
                
                # Clear existing messages
                for doc in subcollection_ref.stream():
                    batch.delete(doc.reference)
                    batch_count += 1
                    if batch_count >= 400:  # Firestore batch limit is 500 operations
                        batch.commit()
                        batch = self.db.batch()
                        batch_count = 0
                
                if batch_count > 0:
                    batch.commit()
                    batch = self.db.batch()
                    batch_count = 0
                
                # Store in chunks of 100 messages per document
                for i in range(0, len(messages), 100):
                    chunk = messages[i:i+100]
                    chunk_doc = subcollection_ref.document(f'chunk_{i//100}')
                    batch.set(chunk_doc, {'messages': chunk})
                    batch_count += 1
                    
                    # Commit every 10 chunks to avoid payload size limits
                    if batch_count >= 10:
                        batch.commit()
                        batch = self.db.batch()
                        batch_count = 0
                
                # Commit any remaining operations
                if batch_count > 0:
                    batch.commit()
                
                print(f"[INFO] Stored {len(messages)} messages in {(len(messages) + 99) // 100} chunks")

            # Store metadata
            if ttl_seconds:
                data['expires_at'] = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat()

            doc_ref.set(data)
            print(f"[INFO] Firestore set successful for {key}")
            return True
        except Exception as e:
            print(f"[ERROR] Firestore set failed for {key}: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

    def get(self, key: str) -> dict:
        """
        Retrieve data from Firestore, checking TTL.
        Reassembles messages from subcollection if needed.
        Returns None if not found or expired.
        """
        try:
            if key.startswith('session:'):
                collection = self.sessions_collection
                doc_id = key.replace('session:', '')
            elif key.startswith('share:'):
                collection = self.shares_collection
                doc_id = key.replace('share:', '')
            else:
                raise ValueError(f"Invalid key format: {key}")

            doc_ref = collection.document(doc_id)
            doc = doc_ref.get()

            if not doc.exists:
                return None

            data = doc.to_dict()

            # Check expiration
            if 'expires_at' in data:
                expires_at = datetime.fromisoformat(data['expires_at'])
                if datetime.utcnow() > expires_at:
                    # Delete expired document and subcollection
                    self._delete_with_subcollection(doc_ref)
                    return None

            # Reassemble messages from subcollection
            subcollection_ref = doc_ref.collection('messages')
            messages = []
            for chunk_doc in subcollection_ref.order_by('__name__').stream():
                chunk_data = chunk_doc.to_dict()
                messages.extend(chunk_data.get('messages', []))
            
            if messages:
                data['messages'] = messages

            return data
        except Exception as e:
            print(f"[ERROR] Firestore get failed for {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        """
        Delete a document and its subcollections from Firestore.
        """
        try:
            if key.startswith('session:'):
                collection = self.sessions_collection
                doc_id = key.replace('session:', '')
            elif key.startswith('share:'):
                collection = self.shares_collection
                doc_id = key.replace('share:', '')
            else:
                raise ValueError(f"Invalid key format: {key}")

            doc_ref = collection.document(doc_id)
            self._delete_with_subcollection(doc_ref)
            return True
        except Exception as e:
            print(f"[ERROR] Firestore delete failed for {key}: {e}")
            return False

    def _delete_with_subcollection(self, doc_ref):
        """Helper to delete document and all subcollections."""
        batch = self.db.batch()
        
        # Delete subcollection documents
        for subcollection in ['messages']:
            sub_ref = doc_ref.collection(subcollection)
            for doc in sub_ref.stream():
                batch.delete(doc.reference)
        
        # Delete main document
        batch.delete(doc_ref)
        batch.commit()

# Global instance
firestore_client = FirestoreClient()
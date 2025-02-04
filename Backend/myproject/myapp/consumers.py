import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, conversation as Conversation, CustomUser
from django.core.files.base import ContentFile
import base64
from django.conf import settings  # Import settings from django.conf

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle new WebSocket connection"""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        await self._join_room()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self._leave_room()

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)
        print(f"Received WebSocket Message: {data}")  # Debugging log

        handlers = {
            'chat_message': self._handle_chat_message,
            'typing': self._handle_typing_status,
            # WebRTC signaling types
            'offer': self._handle_webrtc_signal,
            'answer': self._handle_webrtc_signal,
            'candidate': self._handle_webrtc_signal
        }

        message_type = data.get('type')
        if message_type in handlers:
            await handlers[message_type](data)

    async def _join_room(self):
        """Join the chat room group"""
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def _leave_room(self):
        """Leave the chat room group"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def _handle_webrtc_signal(self, data):
        """Handle WebRTC signaling messages"""
        print(f"Handling WebRTC Signal: {data}")
        
        # Broadcast WebRTC signal to all clients in the conversation
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'webrtc_signal',
                'data': data
            }
        )

    async def webrtc_signal(self, event):
        """Send WebRTC signaling message to WebSocket"""
        await self.send(text_data=json.dumps(event['data']))

    async def _handle_chat_message(self, data):
        """Handle incoming chat messages"""
        message = data.get('message')
        user_id = data.get('user_id')
        image_base64 = data.get('image')

        image_file = None
        if image_base64:
            try:
                # Decode the Base64 image
                format, imgstr = image_base64.split(';base64,')
                ext = format.split('/')[-1]
                image_file = ContentFile(base64.b64decode(imgstr), name=f'temp.{ext}')
            except (ValueError, KeyError, IndexError) as e:
                print(f"Error decoding image: {str(e)}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid image format'
                }))
                return

        # Save the message to the database
        saved_message = await self._save_message_to_db(user_id, message, image_file)
        if image_file:
            await database_sync_to_async(saved_message.image.close)()
        await self._broadcast_message(saved_message)

    async def _handle_typing_status(self, data):
        """Handle typing status updates"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'username': data.get('username'),
                'is_typing': data.get('isTyping')
            }
        )

    async def _broadcast_message(self, message):
        """Broadcast message to the group"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': self._format_message(message)
            }
        )

    def _format_message(self, message):
        """Format message for broadcasting"""
        image_url = message.image.url if message.image else None
        
        return {
            'id': message.id,
            'content': message.content,
            'image': image_url,  # Use the corrected image URL
            'timestamp': message.timestamp.isoformat(),
            'sender': {
                'id': message.sender.id,
                'username': message.sender.username
            }
        }

    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def user_typing(self, event):
        """Send typing status to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'username': event['username'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def _save_message_to_db(self, user_id, message_content, image_file=None):
        """Save message to database"""
        try:
            user = CustomUser.objects.get(id=user_id)
            conv = Conversation.objects.get(id=self.conversation_id)
            return Message.objects.create(
                sender=user,
                Conversation=conv,
                content=message_content,
                image=image_file  # Save the image file
            )
        except (CustomUser.DoesNotExist, Conversation.DoesNotExist) as e:
            print(f"Error saving message: {str(e)}")
            raise ValueError(f"Database error: {str(e)}")
        
class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle new WebSocket connection for WebRTC signaling."""
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'call_{self.room_name}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages for WebRTC signaling."""
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'offer' or message_type == 'answer' or message_type == 'candidate':
            # Broadcast the signaling message to the other peer in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signal_message',
                    'data': data
                }
            )

    async def signal_message(self, event):
        """Send signaling messages to WebSocket."""
        await self.send(text_data=json.dumps(event['data']))
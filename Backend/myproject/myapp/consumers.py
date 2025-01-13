import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, conversation , CustomUser
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async


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
        handlers = {
            'chat_message': self._handle_chat_message,
            'typing': self._handle_typing_status
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

    async def _handle_chat_message(self, data):
        """Handle incoming chat messages"""
        message = data.get('message')
        user_id = data.get('user_id')
        
        saved_message = await self._save_message_to_db(user_id, message)
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
        return {
            'id': message.id,
            'content': message.content,
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
    def _save_message_to_db(self, user_id, message_content):
        """Save message to database"""
        try:
            user = CustomUser.objects.get(id=user_id)
            conversation = Conversation.objects.get(id=self.conversation_id)
            return Message.objects.create(
                sender=user,
                conversation=conversation,
                content=message_content
            )
        except (CustomUser.DoesNotExist, Conversation.DoesNotExist) as e:
            raise ValueError(f"Database error: {str(e)}")

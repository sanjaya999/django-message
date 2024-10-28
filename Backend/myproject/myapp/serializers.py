from rest_framework import serializers
from .models.usermodel import CustomUser , Message , conversation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["fullname" , "email" , "password"]
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}
        }

    def create(self , validated_data):
        user = CustomUser(
            fullname = validated_data['fullname'],
            email = validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
 
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id" , "sender" , "content" , "timestamp" , "is_read" , "reply_to"]


class conversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True , read_only=True)

    class Meta:
        model = conversation
        fields = ['id', 'title', 'is_group', 'members', 'messages', 'created_at']

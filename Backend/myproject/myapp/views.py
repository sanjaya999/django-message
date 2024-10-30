
from django.http import HttpResponse ,JsonResponse
from rest_framework.decorators import api_view 
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework import status
from django.middleware.csrf import get_token
from .models.usermodel import CustomUser , conversation , Message
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from django.shortcuts import get_object_or_404






logger = logging.getLogger(__name__)



# Create your views here.
def index(request):
    return HttpResponse("hello from django")

@api_view(['GET'])
def test_view(request):
    data = {"message": "hello from django"}
    return Response(data)

@api_view(["POST"])
def user_registration(request):
    data = request.data
    fullname = data.get("fullname")
    email = data.get("email")
    password = data.get("password")

    # perform validation
    if not email or not password or not fullname:
        return Response({"message":"email and password and fullname are required",
                         "status" : "400"},status=status.HTTP_400_BAD_REQUEST)
    
    #check if email already exist in database
    if CustomUser.objects.filter(email = email ).exists():
        return Response({"message":"email already exists",
                         "status": "400"}, status=status.HTTP_400_BAD_REQUEST)
    
    #create new user using UserSearilizer
    serializer = UserSerializer(data = data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message":"user created successfully" ,
                         "status" : "201"},status=status.HTTP_201_CREATED)
    return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    

#login check

@api_view(['POST'])
def login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")
    logger.info("Login attempt for email: %s", email)
    
    # perform validation
    if not email or not password:
        return Response({"message": "email password not found", "status": "400"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User does not exist", "status": "400"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    if user.check_password(password):
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Create the response
        response = JsonResponse({
            "message": "User authenticated successfully",
            "status": "200",
            "refresh_token": str(refresh),
            "access_token": access_token,
            "user_id": str(user.id), 
            "user_name": user.fullname if hasattr(user, 'fullname') else user.email 

        })
        
        # Set the access token cookie
        response.set_cookie(
            key='access_token',
            value=access_token,
            max_age=3600,  # 1 hour
            httponly=True,
            secure=True,  # Set to False if not using HTTPS in development
            samesite='Lax'
        )
        
        # Ensure CSRF cookie is set
        get_token(request)
        
        return response
    else:
        logger.warning("Login attempt failed: Invalid password for email: %s", email)
        return Response({"message": "Invalid email or password", "status": "400"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    

@api_view(["GET"])
def search_users(request):

    query = request.GET.get('q' , "")

    if query:
        users = CustomUser.objects.filter(fullname__icontains= query)
    else:
        users = CustomUser.objects.none()

    user_data = [{"id": user.id , "fullName" : user.fullname } for user in users]
    return Response(user_data)


def check_existing_conversation(user1 , user2):
    return conversation.objects.filter(members = user1).filter(members = user2).first()


@api_view(['POST'])
def get_or_create_conversation(request):

    user_id = request.data.get("user_id")
    user_chat = get_object_or_404(CustomUser , id = user_id)
    current_user = request.user

    Conversation = check_existing_conversation(current_user , user_chat)
    if Conversation:
        return Response({'conversation_id': Conversation.id, 'message': 'Existing conversation found.'})
    
    new_conversation = conversation.objects.create(title="" , is_group=False)
    new_conversation.members.add(current_user , user_chat)
    return Response({'conversation_id': new_conversation.id, 'message': 'New conversation created.'})


@api_view(["POST"])
def post_message(request):
    try:
        # Get and validate inputs
        conversation_id = request.data.get("conversation_id")
        content = request.data.get("content")
        reply_to_id = request.data.get("reply_to_id")   

        if not conversation_id:
            return Response({
                'error': 'conversation_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not content:
            return Response({
                'error': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get conversation and check membership
        try:
            chat_conversation = conversation.objects.get(id=conversation_id)
            if request.user not in chat_conversation.members.all():
                return Response({
                    'error': 'You are not a member of this conversation'
                }, status=status.HTTP_403_FORBIDDEN)
        except conversation.DoesNotExist:
            return Response({
                'error': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Handle reply_to
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(
                    id=reply_to_id,
                    Conversation=chat_conversation
                )
            except Message.DoesNotExist:
                return Response({
                    'error': 'Reply message not found in this conversation'
                }, status=status.HTTP_404_NOT_FOUND)

        # Create message
        message = Message.objects.create(
            Conversation=chat_conversation,
            sender=request.user,
            content=content,
            reply_to=reply_to,
            is_read=False
        )

        # Mark as read for sender
        message.is_read = True
        message.save()

        # Prepare response data
        response_data = {
            'message_id': message.id,
            'conversation_id': conversation_id,
            'sender': {
                'id': request.user.id,
                'username': request.user.fullname
            },
            'content': content,
            'timestamp': message.timestamp.isoformat(),
            'is_read': message.is_read
        }

        # Add reply information if present
        if reply_to:
            response_data['reply_to'] = {
                'id': reply_to.id,
                'content': reply_to.content,
                'sender': {
                    'id': reply_to.sender.id,
                    'username': reply_to.sender.username
                },
                'timestamp': reply_to.timestamp.isoformat()
            }

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
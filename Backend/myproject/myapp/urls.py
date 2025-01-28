from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import index , test_view  # Import specific view functions
from .views import user_registration , login ,search_users, get_or_create_conversation,post_message,get_messages,get_user_conversations
urlpatterns = [
    path('', index, name='index'),
    path('api/test/' , test_view , name="test_view"),
    path("register" , user_registration , name="user_registration"),
    path("login" , login , name="login"),
    path("search" , search_users , name="search_users"),
    path('conversations', get_or_create_conversation, name='get_or_create_conversation'),
    path('message', post_message, name='post_message'),
    path('getmessage/<str:conversation_id>', get_messages, name='get_message'),
    path('get-user-conversations', get_user_conversations, name='get-user-conversations'),



]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.urls import path
from .views import index , test_view  # Import specific view functions
from .views import user_registration , login
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', index, name='index'),
    path('api/test/' , test_view , name="test_view"),
    path("register" , user_registration , name="user_registration"),
    path("login" , login , name="login"),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),

    
]

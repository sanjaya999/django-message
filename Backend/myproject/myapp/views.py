from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import status
from .models.usermodel import CustomUser


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
        return Response({"error":"email and password and fullname are required",
                         "status" : "400"},status=status.HTTP_400_BAD_REQUEST)
    
    #check if email already exist in database
    if CustomUser.objects.filter(email = email ).exists():
        return Response({"error":"email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    
    #create new user using UserSearilizer
    serializer = UserSerializer(data = data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message":"user created successfully" ,
                         "status" : "201"},status=status.HTTP_201_CREATED)
    return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
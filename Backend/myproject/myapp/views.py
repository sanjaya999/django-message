from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


# Create your views here.
def index(request):
    return HttpResponse("hello from django")

@api_view(['GET'])
def test_view(request):
    data = {"message": "hello from django"}
    return Response(data)
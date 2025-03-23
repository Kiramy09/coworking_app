from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import CoworkingSpace, Equipment, Booking, CoworkingPayment
from .serializers import (
    CoworkingSpaceSerializer,
    EquipmentSerializer,
    UserSerializer, 
    BookingSerializer,
    CoworkingPaymentSerializer
)

User = get_user_model()

class CoworkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class CoworkingPaymentViewSet(viewsets.ModelViewSet):
    queryset = CoworkingPayment.objects.all()
    serializer_class = CoworkingPaymentSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data['password'])  # Hash du mot de passe
            user.save()
            return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

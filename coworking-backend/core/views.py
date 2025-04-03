from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from .models import Profile
from .models import Booking
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import BookingSerializer  
from rest_framework.decorators import action

from .models import CoworkingSpace, Equipment, Booking, CoworkingPayment 
from .serializers import (
    CoworkingSpaceSerializer,
    EquipmentSerializer,
    UserSerializer, 
    BookingSerializer,
    CoworkingPaymentSerializer,
    UserWithProfileSerializer, 
)

User = get_user_model()

def get_all_bookings(request):
    bookings = Booking.objects.all().values('id', 'start_time', 'end_time', 'is_paid')
    return JsonResponse(list(bookings), safe=False)


def get_bookings(request):
    bookings = Booking.objects.all().values('id', 'start_time', 'end_time', 'is_paid')
    return JsonResponse(list(bookings), safe=False)


# views.py
class CoworkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        space_type = self.request.query_params.get('type')
        city = self.request.query_params.get('city')
        if space_type:
            queryset = queryset.filter(space_type=space_type)
        if city:
            queryset = queryset.filter(city__iexact=city)

        return queryset




class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class CoworkingPaymentViewSet(viewsets.ModelViewSet):
    queryset = CoworkingPayment.objects.all()
    serializer_class = CoworkingPaymentSerializer

# class RegisterView(APIView):
#     def post(self, request):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             user.set_password(request.data['password'])  # Hash du mot de passe
#             user.save()
#             return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RegisterView(APIView):
    def post(self, request):
        serializer = UserWithProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Le serializer s'occupe de créer User + Profile
            return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profil mis à jour avec succès'}, status=200)
        return Response(serializer.errors, status=400)

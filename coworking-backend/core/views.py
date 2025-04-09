from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from .models import Profile
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils.dateparse import parse_datetime

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

# views.py
class CoworkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        space_type = self.request.query_params.get('type')
        metropole = self.request.query_params.get('metropole')

        if space_type:
            queryset = queryset.filter(space_type=space_type)
        if metropole:
            queryset = queryset.filter(metropole__name__iexact=metropole)

        # Filtres avancés
        min_capacity = self.request.query_params.get('min_capacity')
        if min_capacity:
            queryset = queryset.filter(capacity__gte=min_capacity)

        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price_per_hour__lte=max_price)

        equipment = self.request.query_params.get('equipment')
        if equipment:
            queryset = queryset.filter(equipments__name__icontains=equipment)

        return queryset.distinct()




class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['customer'] = request.user.id 
        data['is_paid'] = False

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        space = request.data['coworking_space']
        start = request.data['start_time']
        end = request.data['end_time']

        # Vérifier conflits
        overlap = Booking.objects.filter(
            coworking_space_id=space,
            start_time__lt=end,
            end_time__gt=start
        ).exists()

        if overlap:
            return Response({'error': 'Ce créneau est déjà réservé.'}, status=status.HTTP_400_BAD_REQUEST)

        # Injecter automatiquement le customer connecté
        data = request.data.copy()
        data['customer'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    

class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    

class CheckBookingAvailabilityView(APIView):
    permission_classes = [AllowAny]  # Ou IsAuthenticated si tu veux le restreindre

    def post(self, request):
        space = request.data.get('coworking_space')
        start = parse_datetime(request.data.get('start_time'))
        end = parse_datetime(request.data.get('end_time'))

        if not (space and start and end):
            return Response({'error': 'Paramètres manquants'}, status=400)

        overlap = Booking.objects.filter(
            coworking_space_id=space,
            start_time__lt=end,
            end_time__gt=start
        ).exists()

        return Response({'available': not overlap})
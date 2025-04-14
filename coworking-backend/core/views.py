from django.shortcuts import render
from rest_framework import viewsets, status, generics,request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import get_user_model
from django.http import JsonResponse

from .models import Profile, Booking, CoworkingSpace, Equipment, CoworkingPayment
from .serializers import (
    ProfileSerializer,
    BookingSerializer,
    CoworkingSpaceSerializer,
    EquipmentSerializer,
    UserSerializer,
    CoworkingPaymentSerializer,
    UserWithProfileSerializer,
)

User = get_user_model()


class CoworkingSpaceListCreateView(generics.ListCreateAPIView):
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"detail": "Seuls les administrateurs peuvent ajouter un espace."}, status=403)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)



# 🔐 Récupérer toutes les réservations (admin uniquement)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_bookings(request):
    if not request.user.is_staff:
        return JsonResponse({"detail": "Accès refusé. Réservé aux administrateurs."}, status=403)

    bookings = Booking.objects.all()
    serializer = BookingSerializer(bookings, many=True)
    return JsonResponse(serializer.data, safe=False)

# ❌ Annuler une réservation (utilisateur connecté uniquement)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):
    try:
        booking = Booking.objects.get(id=id, customer=request.user)
        booking.delete()
        return Response({'message': 'Réservation annulée avec succès'}, status=status.HTTP_204_NO_CONTENT)
    except Booking.DoesNotExist:
        return Response({'error': 'Réservation non trouvée ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)

# 👤 Récupérer les réservations de l'utilisateur connecté
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    try:
        bookings = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(bookings, many=True)
        response_data = {
            'user_id': request.user.id,
            'bookings': serializer.data
        }
        return JsonResponse(response_data, status=200)
    except Exception as e:
        print(f"Erreur lors de la récupération des réservations : {str(e)}")
        return JsonResponse({'error': 'Erreur lors de la récupération des réservations.'}, status=500)

# 📦 Espaces de coworking
class CoworkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        space_type = self.request.query_params.get('type')
        city = self.request.query_params.get('city')
        if space_type:
            queryset = queryset.filter(space_type=space_type)
        if city:
            queryset = queryset.filter(city__iexact=city)
        return queryset

# 👥 Utilisateurs
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté (y compris is_staff)"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# 📅 Réservations
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user)

# 💳 Paiements
class CoworkingPaymentViewSet(viewsets.ModelViewSet):
    queryset = CoworkingPayment.objects.all()
    serializer_class = CoworkingPaymentSerializer
    permission_classes = [IsAuthenticated]

# 📝 Inscription
class RegisterView(APIView):
    def post(self, request):
        serializer = UserWithProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 🔧 Mise à jour du profil
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profil mis à jour avec succès'}, status=200)
        return Response(serializer.errors, status=400)

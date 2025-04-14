from django.utils import timezone  
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.decorators import action, api_view, permission_classes

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

# Récupérer toutes les réservations (pour l'admin uniquement)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_bookings(request):
    if not request.user.is_staff:
        return JsonResponse({"detail": "Accès refusé. Réservé aux administrateurs."}, status=403)

    bookings = Booking.objects.all().values('id', 'start_time', 'end_time', 'is_paid')
    return JsonResponse(list(bookings), safe=False)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, id):
    try:
        booking = Booking.objects.get(id=id, customer=request.user)
        booking.delete()
        return Response({'message': 'Réservation annulée avec succès'}, status=status.HTTP_204_NO_CONTENT)
    except Booking.DoesNotExist:
        return Response({'error': 'Réservation non trouvée ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)
    
#  Récupérer les réservations de l'utilisateur connecté
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    try:
        # Vérifier si l'utilisateur est bien identifié
        print(f"Utilisateur connecté : {request.user} (ID : {request.user.id})")

        # Filtrer les réservations de l'utilisateur connecté
        bookings = Booking.objects.filter(customer=request.user)

        if not bookings.exists():
            print(f"Aucune réservation trouvée pour l'utilisateur ID {request.user.id}")
            return JsonResponse({'user_id': request.user.id, 'bookings': []}, status=200)

        # Sérialiser les réservations
        serializer = BookingSerializer(bookings, many=True)
        response_data = {
            'user_id': request.user.id,
            'bookings': serializer.data
        }

        print("Données renvoyées par l'API:", response_data)
        return JsonResponse(response_data, status=200)

    except Exception as e:
        print(f"Erreur lors de la récupération des réservations : {str(e)}")
        return JsonResponse({'error': 'Erreur lors de la récupération des réservations.'}, status=500)


#  ViewSet pour les espaces de coworking
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


#  ViewSet pour les utilisateurs
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)


#  ViewSet pour les réservations
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtrer uniquement les réservations de l'utilisateur connecté
       return Booking.objects.filter(customer=self.request.user)
 
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        booking = self.get_object()

        # Vérifier explicitement l'authentification
        if not request.user.is_authenticated:
            return Response({"error": "Authentification requise"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Vérifier que l'utilisateur est bien le propriétaire de la réservation
        if booking.customer != request.user:
            return Response({"error": "Vous ne pouvez évaluer que vos propres réservations"}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier que la réservation n'a pas déjà été évaluée
        if booking.rating is not None:
            return Response({"error": "Cette réservation a déjà été évaluée"}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Mettre à jour les champs d'avis
        booking.rating = request.data.get('rating')
        booking.review_comment = request.data.get('review_comment')
        booking.review_date = timezone.now()
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

#  ViewSet pour les paiements de coworking
class CoworkingPaymentViewSet(viewsets.ModelViewSet):
    queryset = CoworkingPayment.objects.all()
    serializer_class = CoworkingPaymentSerializer
    permission_classes = [IsAuthenticated]


#  Inscription d'un nouvel utilisateur
class RegisterView(APIView):
    def post(self, request):
        serializer = UserWithProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Créer User + Profile
            return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#  Mise à jour du profil utilisateur
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profil mis à jour avec succès'}, status=200)
        return Response(serializer.errors, status=400)


# views pour les   avis
""" class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filtre pour voir tous les avis ou seulement les siens selon les besoins
        if self.request.query_params.get('all', False):
            return Review.objects.all()
        return Review.objects.filter(booking__customer=self.request.user)
    
    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        booking = Booking.objects.get(id=booking_id)
        
        # Vérifiez que l'utilisateur est bien le propriétaire de la réservation
        if booking.customer != self.request.user:
            raise PermissionDenied("Vous ne pouvez ajouter un avis que sur vos propres réservations")
        
        # Vérifiez qu'il n'y a pas déjà un avis pour cette réservation
        if Review.objects.filter(booking=booking).exists():
            raise ValidationError("Un avis existe déjà pour cette réservation")
            
        serializer.save() """
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .serializers import ProfileSerializer
from .models import Metropole, Profile
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils.dateparse import parse_datetime
from datetime import datetime, timedelta
from django.db.models import Count
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.http import JsonResponse
from rest_framework.decorators import action
from django.utils import timezone


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

class EquipmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer


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
    @action(detail=True, methods=['get'], url_path='reservations', permission_classes=[IsAuthenticated])
    def get_reservations(self, request, pk=None):
        space = self.get_object()
        bookings = Booking.objects.filter(coworking_space=space).order_by('-start_time')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='toggle-visibility')
    def toggle_visibility(self, request, pk=None):
        space = self.get_object()
        space.is_visible = not space.is_visible
        space.save()
        return Response({'success': True, 'is_visible': space.is_visible})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['get'], url_path='bookings', permission_classes=[IsAuthenticated])
    def get_user_bookings(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

        bookings = Booking.objects.filter(customer=user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

# class BookingViewSet(viewsets.ModelViewSet):
#     permission_classes = [IsAuthenticated]
#     queryset = Booking.objects.all()
#     serializer_class = BookingSerializer

    # def create(self, request, *args, **kwargs):
    #     data = request.data.copy()
    #     data['customer'] = request.user.id 
    #     data['is_paid'] = False

    #     serializer = self.get_serializer(data=data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # @action(detail=True, methods=['post'], url_path='add_review')
    # def add_review(self, request, pk=None):
    #     booking = self.get_object()

    #     # Vérifier explicitement l'authentification
    #     if not request.user.is_authenticated:
    #         return Response({"error": "Authentification requise"}, status=status.HTTP_401_UNAUTHORIZED)
        
    #     # Vérifier que l'utilisateur est bien le propriétaire de la réservation
    #     if booking.customer != request.user:
    #         return Response({"error": "Vous ne pouvez évaluer que vos propres réservations"}, 
    #                     status=status.HTTP_403_FORBIDDEN)
        
    #     # Vérifier que la réservation n'a pas déjà été évaluée
    #     if booking.rating is not None:
    #         return Response({"error": "Cette réservation a déjà été évaluée"}, 
    #                     status=status.HTTP_400_BAD_REQUEST)
        
    #     # Mettre à jour les champs d'avis
    #     booking.rating = request.data.get('rating')
    #     booking.review_comment = request.data.get('review_comment')
    #     booking.review_date = timezone.now()
    #     booking.save()
    #     serializer = self.get_serializer(booking)
    #     return Response(serializer.data)
    


class CoworkingPaymentViewSet(viewsets.ModelViewSet):
    queryset = CoworkingPayment.objects.all()
    serializer_class = CoworkingPaymentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='mine')
    def my_payments(self, request):
        user = request.user
        payments = CoworkingPayment.objects.filter(booking__customer=user).select_related('booking__coworking_space')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    

class RegisterView(APIView):
    def post(self, request):
        serializer = UserWithProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
        space = request.data.get('coworking_space')         
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
    
    @action(detail=True, methods=['post'], url_path='add_review')
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
    
    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()

        # Vérification : seul un admin peut supprimer une réservation
        if not request.user.is_staff:
            return Response({'error': 'Accès interdit'}, status=status.HTTP_403_FORBIDDEN)
        booking.delete()
        return Response({'message': 'Réservation supprimée'}, status=status.HTTP_204_NO_CONTENT)

    

    

class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    

class CheckBookingAvailabilityView(APIView):
    permission_classes = [AllowAny]

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
    

class TakenSlotsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        space_id = request.data.get('coworking_space')
        start_str = request.data.get('start_date')
        end_str = request.data.get('end_date') or start_str

        if not space_id or not start_str:
            return Response({"error": "Paramètres manquants"}, status=400)

        start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_str, "%Y-%m-%d").date()

        # bookings sur la plage demandée
        bookings = Booking.objects.filter(
            coworking_space_id=space_id,
            start_time__date__gte=start_date,
            start_time__date__lte=end_date
        )

        taken_slots = {}

        for booking in bookings:
            day = booking.start_time.date().isoformat()  # ex: '2025-04-15'
            if day not in taken_slots:
                taken_slots[day] = set()

            current = booking.start_time
            while current < booking.end_time:
                taken_slots[day].add(current.strftime("%H:%M"))
                current += timedelta(minutes=30)

        # Convertir en format JSON-serializable
        result = {day: sorted(list(slots)) for day, slots in taken_slots.items()}

        return Response({"taken_slots": result})
    


class DashboardStatsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        start = request.data.get("start_date")
        end = request.data.get("end_date")
        view_mode = request.data.get("view_mode", "global")  # 'global', 'metropole', 'type'

        try:
            start_date = datetime.strptime(start, "%Y-%m-%d").date()
            end_date = datetime.strptime(end, "%Y-%m-%d").date()
        except:
            return Response({"error": "Invalid date format"}, status=400)

        bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            end_time__date__lte=end_date
        )

        data = []

        if view_mode == "metropole":
            grouped = CoworkingSpace.objects.values("metropole__name").annotate(
                total_spaces=Count("id")
            )
            for group in grouped:
                name = group["metropole__name"]
                spaces = CoworkingSpace.objects.filter(metropole__name=name)
                capacity = sum(space.capacity for space in spaces)
                occupied = sum(
                    b.coworking_space.capacity for b in bookings if b.coworking_space.metropole and b.coworking_space.metropole.name == name
                )
                percent = round((occupied / capacity) * 100, 1) if capacity else 0
                data.append({"label": name or "Sans métropole", "value": percent})

        elif view_mode == "type":
            grouped = CoworkingSpace.objects.values("space_type").annotate(
                total_spaces=Count("id")
            )
            for group in grouped:
                t = group["space_type"]
                spaces = CoworkingSpace.objects.filter(space_type=t)
                capacity = sum(space.capacity for space in spaces)
                occupied = sum(
                    b.coworking_space.capacity for b in bookings if b.coworking_space.space_type == t
                )
                percent = round((occupied / capacity) * 100, 1) if capacity else 0
                data.append({"label": t, "value": percent})

        else:  # global
            total_capacity = sum(space.capacity for space in CoworkingSpace.objects.all())
            total_occupied = sum(b.coworking_space.capacity for b in bookings)
            percent = round((total_occupied / total_capacity) * 100, 1) if total_capacity else 0
            data = [{"label": "Taux global d’occupation", "value": percent}]

        return Response({"stats": data})


# class MyBookingsView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get_user_bookings(request):
#         bookings = Booking.objects.filter(customer=request.user)

#         if not bookings.exists():
#             return JsonResponse({'user_id': request.user.id, 'bookings': []}, status=200)

#         # Sérialiser les réservations
#         serializer = BookingSerializer(bookings, many=True)
#         response_data = {
#             'user_id': request.user.id,
#             'bookings': serializer.data
#         }

#         return JsonResponse(response_data, status=200)
    

class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(customer=request.user)

        if not bookings.exists():
            return JsonResponse({'user_id': request.user.id, 'bookings': []}, status=200)
        # Sérialiser les réservations
        serializer = BookingSerializer(bookings, many=True)
        response_data = {
            'user_id': request.user.id,
            'bookings': serializer.data
        }
        return JsonResponse(response_data, status=200)
    


class CancelMybooking(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self,request, id):
        try:
            booking = Booking.objects.get(id=id, customer=request.user)
            booking.delete()
            return Response({'message': 'Réservation annulée avec succès'}, status=status.HTTP_204_NO_CONTENT)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation non trouvée ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)
        



# Nouvelles vues pour la gestion du profil utilisateur

class UserProfil(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            profile, created = Profile.objects.get_or_create(user=user)
            
            # Créer un dictionnaire avec les données de l'utilisateur et du profil
            user_data = UserSerializer(user).data
            profile_data = ProfileSerializer(profile).data
            # Combiner les données
            combined_data = {**user_data, **profile_data}
            # Ajouter l'URL de l'avatar s'il existe
            if profile.avatar:
                combined_data['avatar_url'] = request.build_absolute_uri(profile.avatar.url)
            else:
                combined_data['avatar_url'] = None
            return Response(combined_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateUserProfil(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        """
        Mettre à jour le profil de l'utilisateur
        """
        try:
            user = request.user
            profile, created = Profile.objects.get_or_create(user=user)
            
            # Mettre à jour les champs de l'utilisateur
            if 'prenom' in request.data:
                user.first_name = request.data.get('prenom')
                user.save(update_fields=['first_name'])
            
            if 'nom' in request.data:
                user.last_name = request.data.get('nom')
                user.save(update_fields=['last_name'])
            
            # Mettre à jour les champs du profil
            profile_data = {}
            if 'gender' in request.data:
                profile_data['gender'] = request.data.get('gender')
            
            if 'birth_date' in request.data and request.data.get('birth_date'):
                profile_data['birth_date'] = request.data.get('birth_date')
            
            if 'address' in request.data:
                profile_data['address'] = request.data.get('address')
            
            if 'activity' in request.data:
                profile_data['activity'] = request.data.get('activity')
            
            if profile_data:
                profile_serializer = ProfileSerializer(profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                else:
                    return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Récupérer et retourner les données combinées mises à jour
            user_data = UserSerializer(user).data
            profile_data = ProfileSerializer(profile).data
            
            combined_data = {**user_data, **profile_data}
            
            # Ajouter l'URL de l'avatar s'il existe
            if profile.avatar:
                combined_data['avatar_url'] = request.build_absolute_uri(profile.avatar.url)
            else:
                combined_data['avatar_url'] = None
            
            return Response(combined_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateUserProfilAvatar(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        """
        Télécharger et mettre à jour l'avatar de l'utilisateur
        """
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            if 'avatar' not in request.FILES:
                return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Mettre à jour l'avatar
            profile.avatar = request.FILES['avatar']
            profile.save(update_fields=['avatar'])
            
            # Récupérer l'URL de l'avatar
            avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
            
            return Response({
                'message': 'Avatar mis à jour avec succès',
                'avatar_url': avatar_url
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AdminCoworkingSpaceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les espaces de coworking (admin)"""
    queryset = CoworkingSpace.objects.all()
    serializer_class = CoworkingSpaceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]  # Seulement les admins

     # Action personnalisée pour récupérer les métropoles
    @action(detail=False, methods=['get'], url_path='metropoles')
    def get_metropoles(self, request):
        """Retourne la liste des métropoles"""
        metropoles = Metropole.objects.all().values('id', 'name')
        return Response(metropoles, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        """Surcharge de la méthode create pour gérer les cas spéciaux"""
        data = request.data.copy()
        
         # Log des données reçues
        print("Données reçues pour création :", data)

        # Gestion de la métropole
        metropole_name = data.get('metropole')
        if metropole_name:
            try:
                metropole = Metropole.objects.get(name=metropole_name)
                data['metropole'] = metropole.id  # Convertir en ID pour le serializer
            except Metropole.DoesNotExist:
                return Response(
                    {"error": f"La métropole '{metropole_name}' n'existe pas."},
                    status=status.HTTP_400_BAD_REQUEST
            )
        
        # Appeler la méthode standard pour créer l'espace
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Créer l'instance mais désactiver la logique automatique de la méthode save
            instance = serializer.save()
            
            # Si des équipements sont fournis, les associer
            if 'equipments' in data:
                equipment_ids = data.getlist('equipments')
                if equipment_ids:
                    instance.equipments.set(equipment_ids)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
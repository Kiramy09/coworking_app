from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from .models import Profile

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
        city = self.request.query_params.get('city')
        if space_type:
            queryset = queryset.filter(space_type=space_type)
        if city:
            queryset = queryset.filter(city__iexact=city)

        return queryset



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

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



# Nouvelles vues pour la gestion du profil utilisateur
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Récupérer le profil de l'utilisateur connecté
    """
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
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
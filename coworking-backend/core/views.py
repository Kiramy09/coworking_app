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
from datetime import datetime, timedelta
from django.db.models import Count


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
    

# class TakenSlotsView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         space_id = request.data.get('coworking_space')
#         date_str = request.data.get('date')  # ex: "2025-04-18"

#         if not space_id or not date_str:
#             return Response({"error": "Paramètres manquants"}, status=400)

#         date = datetime.strptime(date_str, "%Y-%m-%d")
#         bookings = Booking.objects.filter(
#             coworking_space_id=space_id,
#             start_time__date=date
#         )

#         # Création des créneaux occupés
#         taken_slots = set()
#         for booking in bookings:
#             start = booking.start_time
#             end = booking.end_time

#             current = start
#             while current < end:
#                 taken_slots.add(current.strftime("%H:%M"))
#                 current += timedelta(minutes=30)

#         return Response({"taken_slots": sorted(taken_slots)})
    

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


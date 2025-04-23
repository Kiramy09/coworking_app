from rest_framework import serializers
from .models import *
from .models import User
from .models import Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'


# class CoworkingSpaceSerializer(serializers.ModelSerializer):
#     # equipments = EquipmentSerializer(many=True, read_only=True)

#     equipments = serializers.PrimaryKeyRelatedField(
#         queryset=Equipment.objects.all(),
#         many=True,
#         # write_only=True
#     )
#     equipments_info = EquipmentSerializer(source='equipments', many=True, read_only=True)
#     image = serializers.ImageField(required=False)
#     metropole = serializers.StringRelatedField()


#     class Meta:
#         model = CoworkingSpace
#         fields = '__all__'

class CoworkingSpaceSerializer(serializers.ModelSerializer):
    # Utiliser le nom de la métropole au lieu de l'ID
    metropole = serializers.CharField(source='metropole.name', required=False, allow_null=True)
    equipments = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        many=True,
    )
    equipments_info = EquipmentSerializer(source='equipments', many=True, read_only=True)
    image = serializers.ImageField(required=False)

    class Meta:
        model = CoworkingSpace
        fields = [
            'id', 'name', 'description', 'address', 'city', 'metropole',
            'capacity', 'price_per_hour', 'image',
            'equipments',           # utilisé pour les PUT/POST
            'equipments_info',      # utilisé pour l'affichage (GET)
            'latitude', 'longitude'
        ]

    def validate_metropole(self, value):
        """Valider que le nom de la métropole existe."""
        if value:
            try:
                return Metropole.objects.get(name=value)
            except Metropole.DoesNotExist:
                raise serializers.ValidationError(f"La métropole '{value}' n'existe pas.")
        return None

    def update(self, instance, validated_data):
        """Gérer la mise à jour de la métropole."""
        metropole_data = validated_data.pop('metropole', None)
        if metropole_data:
            instance.metropole = metropole_data
        return super().update(instance, validated_data)

    def create(self, validated_data):
        """Gérer la création avec le nom de la métropole."""
        metropole_data = validated_data.pop('metropole', None)
        if metropole_data:
            validated_data['metropole'] = metropole_data
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password', 'is_staff']

    def create(self, validated_data):
        # On utilise le manager pour hasher le mot de passe
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['full_name'] = f"{instance.first_name} {instance.last_name}"
        return rep

# class BookingSerializer(serializers.ModelSerializer):
#     customer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
#     coworking_space = serializers.PrimaryKeyRelatedField(queryset=CoworkingSpace.objects.all())

#     class Meta:
#         model = Booking
#         fields = '__all__'

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep['customer'] = UserSerializer(instance.customer).data
#         rep['coworking_space'] = CoworkingSpaceSerializer(instance.coworking_space).data
#         return rep

class BookingSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.SerializerMethodField()

    coworking_space = serializers.PrimaryKeyRelatedField(
        queryset=CoworkingSpace.objects.all(), write_only=True
    )
    coworking_space_info = CoworkingSpaceSerializer(source='coworking_space', read_only=True)


    
    class Meta:
        model = Booking
        fields = [
            'id', 'start_time', 'end_time', 'is_paid',
            'customer_email', 'customer_name','customer',               
            'coworking_space',         # ID pour POST/PUT
            'coworking_space_info',    # Détail pour GET
            'rating',                 #  note
            'review_comment',         # commentaire
            'review_date'
        ]

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"


class CoworkingPaymentSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())

    class Meta:
        model = CoworkingPayment
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['booking'] = BookingSerializer(instance.booking).data
        return rep


class UserWithProfileSerializer(serializers.ModelSerializer):
    # Champs supplémentaires du profil
    # gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES)
    gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES, required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True)
    activity = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'gender', 'birth_date', 'address', 'activity', 'avatar'
        ]

    def create(self, validated_data):
        # Séparer les données utilisateur et profil
        profile_data = {
            'gender': validated_data.pop('gender', None),
            'birth_date': validated_data.pop('birth_date', None),
            'address': validated_data.pop('address', ''),
            'activity': validated_data.pop('activity', ''),
            'avatar': validated_data.pop('avatar', None),
        }

        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, **profile_data)
        return user
        

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['gender', 'birth_date', 'address', 'activity', 'avatar']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff  # Ajout dans la réponse frontend
        return data
    

    
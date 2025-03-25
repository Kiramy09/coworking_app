from rest_framework import serializers
from .models import *
from .models import User
from .models import Profile


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'


class CoworkingSpaceSerializer(serializers.ModelSerializer):
    equipments = EquipmentSerializer(many=True, read_only=True)

    class Meta:
        model = CoworkingSpace
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password']

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

class BookingSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    coworking_space = serializers.PrimaryKeyRelatedField(queryset=CoworkingSpace.objects.all())

    class Meta:
        model = Booking
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['customer'] = UserSerializer(instance.customer).data
        rep['coworking_space'] = CoworkingSpaceSerializer(instance.coworking_space).data
        return rep


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
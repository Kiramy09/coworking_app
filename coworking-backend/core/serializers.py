from rest_framework import serializers
from .models import *
from .models import User


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

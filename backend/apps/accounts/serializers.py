from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Role, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name", "role",
            "phone", "organization_name", "blood_group", "is_donor_available",
            "is_verified", "lat", "lng", "date_joined",
        )
        read_only_fields = ("id", "is_verified", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            "username", "email", "password", "first_name", "last_name",
            "role", "phone", "organization_name", "blood_group",
        )

    def validate_role(self, value):
        if value == Role.ADMIN:
            raise serializers.ValidationError("Admin accounts cannot self-register.")
        return value

    def validate(self, attrs):
        if attrs.get("role") in (Role.NGO, Role.BLOOD_BANK) and not attrs.get("organization_name"):
            raise serializers.ValidationError(
                {"organization_name": "Organization name is required for NGO and blood bank accounts."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        # NGOs and blood banks start unverified until an admin confirms them.
        user.is_verified = user.role not in (Role.NGO, Role.BLOOD_BANK)
        user.save()
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds role/profile info directly into the JWT so the frontend can
    render the right dashboard without an extra round trip on login.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        token["is_verified"] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data

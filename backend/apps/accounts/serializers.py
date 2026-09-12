from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone',
            'organization_name',
            'blood_group',
            'is_donor_available',
            'is_verified',
            'lat',
            'lng',
            'date_joined',
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    # CRITICAL: trim_whitespace=False ensures leading/trailing spaces are not silently trimmed
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
    )
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
    )
    organization_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
    )
    blood_group = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=5,
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'role',
            'phone',
            'organization_name',
            'blood_group',
        ]

    def validate_password(self, value):
        # Validate password using Django's configured password validators
        validate_password(value)
        return value

    def validate(self, attrs):
        role = attrs.get('role', 'general')

        # Keep admin self-registration blocked
        if role == 'admin' or role == getattr(getattr(User, 'Role', None), 'ADMIN', 'admin'):
            raise serializers.ValidationError({"role": "Admin accounts cannot self-register."})

        # Validate role-specific fields
        if role in ['ngo', 'blood_bank']:
            org_name = attrs.get('organization_name')
            if not org_name or not str(org_name).strip():
                raise serializers.ValidationError({
                    "organization_name": f"Organization name is required for {role.replace('_', ' ').upper()} accounts."
                })

        if role == 'donor':
            blood_group = attrs.get('blood_group')
            valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            if blood_group and blood_group not in valid_groups:
                raise serializers.ValidationError({"blood_group": "Invalid blood group selected."})

        # Validate phone if provided
        phone = attrs.get('phone')
        if phone and str(phone).strip():
            digits = ''.join(c for c in str(phone) if c.isdigit())
            if len(digits) < 7 or len(digits) > 15:
                raise serializers.ValidationError({"phone": "Enter a valid phone number (7-15 digits)."})

        return attrs

    def create(self, validated_data):
        role = validated_data.get('role', 'general')
        # NGO and Blood Bank accounts require administrator verification
        is_verified = role not in ['ngo', 'blood_bank']

        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            phone=validated_data.get('phone', ''),
            organization_name=validated_data.get('organization_name', '') if role in ['ngo', 'blood_bank'] else '',
            blood_group=validated_data.get('blood_group', '') if role == 'donor' else '',
            is_donor_available=(role == 'donor'),
            is_verified=is_verified,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

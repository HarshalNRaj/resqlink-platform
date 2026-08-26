from django.test import TestCase
from rest_framework.serializers import ValidationError

from .models import Role
from .serializers import RegisterSerializer


class RegistrationRoleTests(TestCase):
	def test_receiver_role_is_valid(self):
		serializer = RegisterSerializer(data={
			"username": "receiver1",
			"email": "receiver@example.com",
			"password": "Strong-password-123!",
			"role": Role.RECEIVER,
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		user = serializer.save()
		self.assertEqual(user.role, Role.RECEIVER)

	def test_admin_cannot_self_register(self):
		serializer = RegisterSerializer(data={
			"username": "admin2",
			"email": "admin@example.com",
			"password": "Strong-password-123!",
			"role": Role.ADMIN,
		})

		with self.assertRaises(ValidationError):
			serializer.is_valid(raise_exception=True)

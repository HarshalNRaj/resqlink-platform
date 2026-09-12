from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from ..common.permissions import IsVerifiedOrganization

User = get_user_model()


class AccountsRegistrationAndVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_password_leading_trailing_spaces_not_trimmed(self):
        password_with_spaces = "  SecretPass123!  "
        payload = {
            "username": "spacetest",
            "email": "space@example.com",
            "password": password_with_spaces,
            "role": "receiver",
            "phone": "+1234567890",
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="spacetest")
        # Ensure the leading/trailing spaces were NOT trimmed
        self.assertTrue(user.check_password(password_with_spaces))
        self.assertFalse(user.check_password("SecretPass123!"))

    def test_phone_saved_properly(self):
        payload = {
            "username": "phonetest",
            "email": "phone@example.com",
            "password": "ValidPass123!",
            "role": "donor",
            "phone": "+19876543210",
            "blood_group": "O+",
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="phonetest")
        self.assertEqual(user.phone, "+19876543210")
        self.assertEqual(user.blood_group, "O+")

    def test_admin_self_registration_blocked(self):
        payload = {
            "username": "badadmin",
            "email": "admin@example.com",
            "password": "ValidPass123!",
            "role": "admin",
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", res.data)

    def test_ngo_requires_organization_name(self):
        payload = {
            "username": "testngo",
            "email": "ngo@example.com",
            "password": "ValidPass123!",
            "role": "ngo",
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("organization_name", res.data)

        payload["organization_name"] = "Hope Global Relief"
        res2 = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="testngo")
        self.assertFalse(user.is_verified)

    def test_blood_bank_requires_organization_name(self):
        payload = {
            "username": "testbloodbank",
            "email": "bloodbank@example.com",
            "password": "ValidPass123!",
            "role": "blood_bank",
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("organization_name", res.data)

        payload["organization_name"] = "City Center Blood Bank"
        res2 = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="testbloodbank")
        self.assertFalse(user.is_verified)

    def test_is_verified_organization_permission(self):
        perm = IsVerifiedOrganization()

        class MockView:
            pass

        class MockRequest:
            def __init__(self, user):
                self.user = user

        # Receiver should never be blocked
        receiver = User(username='rec', role='receiver', is_verified=False)
        self.assertTrue(perm.has_permission(MockRequest(receiver), MockView()))

        # Donor should never be blocked
        donor = User(username='don', role='donor', is_verified=False)
        self.assertTrue(perm.has_permission(MockRequest(donor), MockView()))

        # Volunteer should never be blocked
        vol = User(username='vol', role='volunteer', is_verified=False)
        self.assertTrue(perm.has_permission(MockRequest(vol), MockView()))

        # Unverified NGO should be blocked
        unverified_ngo = User(username='ngo', role='ngo', is_verified=False)
        self.assertFalse(perm.has_permission(MockRequest(unverified_ngo), MockView()))

        # Verified NGO should pass
        verified_ngo = User(username='v_ngo', role='ngo', is_verified=True)
        self.assertTrue(perm.has_permission(MockRequest(verified_ngo), MockView()))

        # Unverified Blood Bank should be blocked
        unverified_bb = User(username='bb', role='blood_bank', is_verified=False)
        self.assertFalse(perm.has_permission(MockRequest(unverified_bb), MockView()))

        # Verified Blood Bank should pass
        verified_bb = User(username='v_bb', role='blood_bank', is_verified=True)
        self.assertTrue(perm.has_permission(MockRequest(verified_bb), MockView()))

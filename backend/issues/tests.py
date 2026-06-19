from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Issue


class IssueModelTest(TestCase):
    def test_create_issue(self):
        issue = Issue.objects.create(
            title='Test Issue',
            description='This is a test description',
            priority='High',
            status='Open',
        )
        self.assertEqual(issue.title, 'Test Issue')
        self.assertEqual(issue.priority, 'High')
        self.assertEqual(issue.status, 'Open')
        self.assertIsNotNone(issue.created_at)

    def test_default_status_is_open(self):
        issue = Issue.objects.create(
            title='Default Status',
            description='Checking default status value',
            priority='Low',
        )
        self.assertEqual(issue.status, 'Open')

    def test_str_representation(self):
        issue = Issue.objects.create(
            title='String Test',
            description='Testing string representation',
            priority='Medium',
        )
        self.assertEqual(str(issue), 'String Test')


class IssueAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_issues(self):
        Issue.objects.create(
            title='Issue 1', description='Description for issue 1', priority='Low'
        )
        response = self.client.get('/api/issues/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_issue(self):
        data = {
            'title': 'New Issue',
            'description': 'Description for the new issue',
            'priority': 'Medium',
        }
        response = self.client.post('/api/issues/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Issue')
        self.assertEqual(response.data['status'], 'Open')

    def test_create_issue_validation_title_too_short(self):
        data = {
            'title': 'ab',
            'description': 'Valid description here',
            'priority': 'Low',
        }
        response = self.client.post('/api/issues/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_issue_validation_description_too_short(self):
        data = {
            'title': 'Valid Title',
            'description': 'short',
            'priority': 'Low',
        }
        response = self.client.post('/api/issues/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)

    def test_update_issue_status(self):
        issue = Issue.objects.create(
            title='Status Update',
            description='Testing status update',
            priority='High',
        )
        response = self.client.patch(
            f'/api/issues/{issue.id}/', {'status': 'In Progress'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'In Progress')

    def test_update_issue_invalid_status(self):
        issue = Issue.objects.create(
            title='Invalid Status',
            description='Testing invalid status',
            priority='High',
        )
        response = self.client.patch(
            f'/api/issues/{issue.id}/', {'status': 'Invalid'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_not_allowed(self):
        issue = Issue.objects.create(
            title='No PUT', description='Testing PUT not allowed', priority='Low'
        )
        response = self.client.put(f'/api/issues/{issue.id}/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

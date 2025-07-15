from django.urls import path
from .views import DocumentUploadView, AskQuestionView

urlpatterns = [
    path('upload/', DocumentUploadView.as_view(), name='upload'),
    path('ask/', AskQuestionView.as_view(), name='ask'),
]
